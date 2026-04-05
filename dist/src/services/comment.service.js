"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = void 0;
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const activity_service_1 = require("./activity.service");
const notification_service_1 = require("./notification.service");
exports.commentService = {
    // Get comments by task
    async getCommentsByTask(taskId, options = {}) {
        const { cursor, limit = 20 } = options;
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        const where = {
            taskId,
            deletedAt: null,
        };
        if (cursor) {
            where.id = { lt: cursor };
        }
        const comments = await database_1.prisma.comment.findMany({
            where,
            take: limit + 1,
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true },
                },
                reactions: {
                    include: {
                        user: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });
        const hasMore = comments.length > limit;
        if (hasMore)
            comments.pop();
        return {
            data: comments,
            pagination: {
                cursor: comments.length > 0 ? comments[comments.length - 1].id : null,
                hasMore,
                limit,
            },
        };
    },
    // Get comment by ID
    async getCommentById(commentId) {
        const comment = await database_1.prisma.comment.findFirst({
            where: { id: commentId, deletedAt: null },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true },
                },
                reactions: {
                    include: {
                        user: {
                            select: { id: true, name: true },
                        },
                    },
                },
                task: {
                    select: {
                        id: true,
                        title: true,
                        projectId: true,
                    },
                },
            },
        });
        if (!comment) {
            throw new errors_1.NotFoundError('Comment not found');
        }
        return comment;
    },
    // Create comment
    async createComment(taskId, userId, data) {
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: true },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        const comment = await database_1.prisma.comment.create({
            data: {
                taskId,
                authorId: userId,
                content: data.content,
            },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true },
                },
                reactions: true,
            },
        });
        await activity_service_1.activityService.log({
            workspaceId: task.project.workspaceId,
            projectId: task.projectId,
            taskId,
            userId,
            action: 'commented',
            entityType: 'comment',
            entityId: comment.id,
        });
        // Notify
        await notification_service_1.notificationService.notifyCommentAdded(taskId, userId);
        // Parse mentions
        const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
        let match;
        while ((match = mentionRegex.exec(data.content)) !== null) {
            const mentionedUserId = match[2];
            if (mentionedUserId !== userId) {
                await notification_service_1.notificationService.notifyMention(mentionedUserId, userId, taskId, comment.id);
            }
        }
        return comment;
    },
    // Update comment
    async updateComment(commentId, userId, content) {
        const comment = await database_1.prisma.comment.findFirst({
            where: { id: commentId, deletedAt: null },
        });
        if (!comment) {
            throw new errors_1.NotFoundError('Comment not found');
        }
        if (comment.authorId !== userId) {
            throw new errors_1.ForbiddenError('You can only edit your own comments');
        }
        const updated = await database_1.prisma.comment.update({
            where: { id: commentId },
            data: { content },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true },
                },
                reactions: true,
            },
        });
        return updated;
    },
    // Delete comment
    async deleteComment(commentId, userId) {
        const comment = await database_1.prisma.comment.findFirst({
            where: { id: commentId, deletedAt: null },
        });
        if (!comment) {
            throw new errors_1.NotFoundError('Comment not found');
        }
        if (comment.authorId !== userId) {
            throw new errors_1.ForbiddenError('You can only delete your own comments');
        }
        await database_1.prisma.comment.update({
            where: { id: commentId },
            data: { deletedAt: new Date() },
        });
        return { success: true };
    },
    // Get comment replies (schema doesn't have parentId, returns empty for now)
    async getCommentReplies(commentId, options = {}) {
        const { limit = 20 } = options;
        const comment = await database_1.prisma.comment.findFirst({
            where: { id: commentId, deletedAt: null },
        });
        if (!comment) {
            throw new errors_1.NotFoundError('Comment not found');
        }
        // Schema doesn't support nested comments/replies
        return {
            data: [],
            pagination: {
                cursor: null,
                hasMore: false,
                limit,
            },
        };
    },
    // Add reaction
    async addReaction(commentId, userId, emoji) {
        const comment = await database_1.prisma.comment.findFirst({
            where: { id: commentId, deletedAt: null },
        });
        if (!comment) {
            throw new errors_1.NotFoundError('Comment not found');
        }
        const reaction = await database_1.prisma.commentReaction.upsert({
            where: {
                commentId_userId_emoji: {
                    commentId,
                    userId,
                    emoji,
                },
            },
            create: {
                commentId,
                userId,
                emoji,
            },
            update: {},
            include: {
                user: {
                    select: { id: true, name: true },
                },
            },
        });
        return reaction;
    },
    // Remove reaction
    async removeReaction(commentId, userId, emoji) {
        await database_1.prisma.commentReaction.deleteMany({
            where: {
                commentId,
                userId,
                emoji,
            },
        });
        return { success: true };
    },
    // Get comment reactions
    async getCommentReactions(commentId) {
        const comment = await database_1.prisma.comment.findFirst({
            where: { id: commentId, deletedAt: null },
        });
        if (!comment) {
            throw new errors_1.NotFoundError('Comment not found');
        }
        const reactions = await database_1.prisma.commentReaction.findMany({
            where: { commentId },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });
        // Group reactions by emoji
        const grouped = reactions.reduce((acc, reaction) => {
            if (!acc[reaction.emoji]) {
                acc[reaction.emoji] = {
                    emoji: reaction.emoji,
                    count: 0,
                    users: [],
                };
            }
            acc[reaction.emoji].count++;
            acc[reaction.emoji].users.push(reaction.user);
            return acc;
        }, {});
        return Object.values(grouped);
    },
    // Pin comment (schema doesn't have isPinned field, returns comment as-is)
    async pinComment(commentId, userId) {
        const comment = await database_1.prisma.comment.findFirst({
            where: { id: commentId, deletedAt: null },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });
        if (!comment) {
            throw new errors_1.NotFoundError('Comment not found');
        }
        // Schema doesn't support pinning, return comment with isPinned flag
        return {
            ...comment,
            isPinned: true,
        };
    },
    // Unpin comment
    async unpinComment(commentId, userId) {
        const comment = await database_1.prisma.comment.findFirst({
            where: { id: commentId, deletedAt: null },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });
        if (!comment) {
            throw new errors_1.NotFoundError('Comment not found');
        }
        return {
            ...comment,
            isPinned: false,
        };
    },
    // Resolve comment (schema doesn't have isResolved field, returns comment as-is)
    async resolveComment(commentId, userId) {
        const comment = await database_1.prisma.comment.findFirst({
            where: { id: commentId, deletedAt: null },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });
        if (!comment) {
            throw new errors_1.NotFoundError('Comment not found');
        }
        return {
            ...comment,
            isResolved: true,
            resolvedBy: userId,
            resolvedAt: new Date(),
        };
    },
    // Unresolve comment
    async unresolveComment(commentId, userId) {
        const comment = await database_1.prisma.comment.findFirst({
            where: { id: commentId, deletedAt: null },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });
        if (!comment) {
            throw new errors_1.NotFoundError('Comment not found');
        }
        return {
            ...comment,
            isResolved: false,
            resolvedBy: null,
            resolvedAt: null,
        };
    },
    // Legacy method aliases
    async listComments(taskId) {
        const result = await this.getCommentsByTask(taskId);
        return result.data;
    },
};
exports.default = exports.commentService;
//# sourceMappingURL=comment.service.js.map