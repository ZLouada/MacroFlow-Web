"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.labelService = exports.commentService = void 0;
const database_js_1 = require("../config/database.js");
const errors_js_1 = require("../utils/errors.js");
const activity_service_js_1 = require("./activity.service.js");
const notification_service_js_1 = require("./notification.service.js");
const socket_service_js_1 = require("./socket.service.js");
// ===========================================
// Comment Service
// ===========================================
exports.commentService = {
    // List comments for task
    async listComments(taskId) {
        const comments = await database_js_1.prisma.comment.findMany({
            where: { taskId, deletedAt: null },
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
            orderBy: { createdAt: 'asc' },
        });
        return comments;
    },
    // Create comment
    async createComment(taskId, userId, data) {
        const task = await database_js_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: true },
        });
        if (!task) {
            throw new errors_js_1.NotFoundError('Task not found');
        }
        const comment = await database_js_1.prisma.comment.create({
            data: {
                taskId,
                authorId: userId,
                content: data.content,
            },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });
        await activity_service_js_1.activityService.log({
            workspaceId: task.project.workspaceId,
            projectId: task.projectId,
            taskId,
            userId,
            action: 'commented',
            entityType: 'comment',
            entityId: comment.id,
        });
        // Notify
        await notification_service_js_1.notificationService.notifyCommentAdded(taskId, userId);
        // Real-time
        const socketService = (0, socket_service_js_1.getSocketService)();
        socketService.notifyCommentAdded(taskId, comment);
        // Parse mentions
        const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
        let match;
        while ((match = mentionRegex.exec(data.content)) !== null) {
            const mentionedUserId = match[2];
            if (mentionedUserId !== userId) {
                await notification_service_js_1.notificationService.notifyMention(mentionedUserId, userId, taskId, comment.id);
            }
        }
        return comment;
    },
    // Update comment
    async updateComment(commentId, userId, data) {
        const comment = await database_js_1.prisma.comment.findFirst({
            where: { id: commentId, deletedAt: null },
        });
        if (!comment) {
            throw new errors_js_1.NotFoundError('Comment not found');
        }
        if (comment.authorId !== userId) {
            throw new errors_js_1.ForbiddenError('You can only edit your own comments');
        }
        const updated = await database_js_1.prisma.comment.update({
            where: { id: commentId },
            data: { content: data.content },
        });
        return updated;
    },
    // Delete comment
    async deleteComment(commentId, userId) {
        const comment = await database_js_1.prisma.comment.findFirst({
            where: { id: commentId, deletedAt: null },
        });
        if (!comment) {
            throw new errors_js_1.NotFoundError('Comment not found');
        }
        if (comment.authorId !== userId) {
            throw new errors_js_1.ForbiddenError('You can only delete your own comments');
        }
        await database_js_1.prisma.comment.update({
            where: { id: commentId },
            data: { deletedAt: new Date() },
        });
    },
    // Add reaction
    async addReaction(commentId, userId, emoji) {
        const reaction = await database_js_1.prisma.commentReaction.upsert({
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
        });
        return reaction;
    },
    // Remove reaction
    async removeReaction(commentId, userId, emoji) {
        await database_js_1.prisma.commentReaction.deleteMany({
            where: {
                commentId,
                userId,
                emoji,
            },
        });
    },
};
// ===========================================
// Label Service
// ===========================================
exports.labelService = {
    // List labels for workspace
    async listLabels(workspaceId) {
        const labels = await database_js_1.prisma.label.findMany({
            where: { workspaceId },
            orderBy: { name: 'asc' },
        });
        return labels;
    },
    // Create label
    async createLabel(workspaceId, data) {
        const label = await database_js_1.prisma.label.create({
            data: {
                workspaceId,
                name: data.name,
                color: data.color,
            },
        });
        return label;
    },
    // Update label
    async updateLabel(labelId, data) {
        const label = await database_js_1.prisma.label.findUnique({
            where: { id: labelId },
        });
        if (!label) {
            throw new errors_js_1.NotFoundError('Label not found');
        }
        const updated = await database_js_1.prisma.label.update({
            where: { id: labelId },
            data,
        });
        return updated;
    },
    // Delete label
    async deleteLabel(labelId) {
        const label = await database_js_1.prisma.label.findUnique({
            where: { id: labelId },
        });
        if (!label) {
            throw new errors_js_1.NotFoundError('Label not found');
        }
        // This will cascade delete TaskLabel entries
        await database_js_1.prisma.label.delete({
            where: { id: labelId },
        });
    },
};
exports.default = { commentService: exports.commentService, labelService: exports.labelService };
//# sourceMappingURL=comment.service.js.map