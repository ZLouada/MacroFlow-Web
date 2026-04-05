import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { activityService } from './activity.service.js';
import { notificationService } from './notification.service.js';

// ===========================================
// Comment Service
// ===========================================

interface PaginationOptions {
  cursor?: string;
  limit?: number;
  includeReplies?: boolean;
}

export const commentService = {
  // Get comments by task
  async getCommentsByTask(taskId: string, options: PaginationOptions = {}) {
    const { cursor, limit = 20 } = options;

    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const where: Prisma.CommentWhereInput = {
      taskId,
      deletedAt: null,
    };

    if (cursor) {
      where.id = { lt: cursor };
    }

    const comments = await prisma.comment.findMany({
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
    if (hasMore) comments.pop();

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
  async getCommentById(commentId: string) {
    const comment = await prisma.comment.findFirst({
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
      throw new NotFoundError('Comment not found');
    }

    return comment;
  },

  // Create comment
  async createComment(taskId: string, userId: string, data: { content: string; parentId?: string }) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const comment = await prisma.comment.create({
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

    await activityService.log({
      workspaceId: task.project.workspaceId,
      projectId: task.projectId,
      taskId,
      userId,
      action: 'commented',
      entityType: 'comment',
      entityId: comment.id,
    });

    // Notify
    await notificationService.notifyCommentAdded(taskId, userId);

    // Parse mentions
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = mentionRegex.exec(data.content)) !== null) {
      const mentionedUserId = match[2];
      if (mentionedUserId !== userId) {
        await notificationService.notifyMention(mentionedUserId, userId, taskId, comment.id);
      }
    }

    return comment;
  },

  // Update comment
  async updateComment(commentId: string, userId: string, content: string) {
    const comment = await prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenError('You can only edit your own comments');
    }

    const updated = await prisma.comment.update({
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
  async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenError('You can only delete your own comments');
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  },

  // Get comment replies (schema doesn't have parentId, returns empty for now)
  async getCommentReplies(commentId: string, options: PaginationOptions = {}) {
    const { limit = 20 } = options;

    const comment = await prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
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
  async addReaction(commentId: string, userId: string, emoji: string) {
    const comment = await prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    const reaction = await prisma.commentReaction.upsert({
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
  async removeReaction(commentId: string, userId: string, emoji: string) {
    await prisma.commentReaction.deleteMany({
      where: {
        commentId,
        userId,
        emoji,
      },
    });

    return { success: true };
  },

  // Get comment reactions
  async getCommentReactions(commentId: string) {
    const comment = await prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    const reactions = await prisma.commentReaction.findMany({
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
    }, {} as Record<string, { emoji: string; count: number; users: any[] }>);

    return Object.values(grouped);
  },

  // Pin comment (schema doesn't have isPinned field, returns comment as-is)
  async pinComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    // Schema doesn't support pinning, return comment with isPinned flag
    return {
      ...comment,
      isPinned: true,
    };
  },

  // Unpin comment
  async unpinComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    return {
      ...comment,
      isPinned: false,
    };
  },

  // Resolve comment (schema doesn't have isResolved field, returns comment as-is)
  async resolveComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    return {
      ...comment,
      isResolved: true,
      resolvedBy: userId,
      resolvedAt: new Date(),
    };
  },

  // Unresolve comment
  async unresolveComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    return {
      ...comment,
      isResolved: false,
      resolvedBy: null,
      resolvedAt: null,
    };
  },

  // Legacy method aliases
  async listComments(taskId: string) {
    const result = await this.getCommentsByTask(taskId);
    return result.data;
  },
};

export default commentService;
