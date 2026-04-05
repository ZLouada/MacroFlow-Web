import { Response, NextFunction } from 'express';
import { commentService } from '../services/comment.service';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../utils/errors';

export const commentController = {
  /**
   * Create a comment on a task
   * POST /api/v1/tasks/:taskId/comments
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { taskId } = req.params;
      const { content, parentId } = req.body;

      const comment = await commentService.createComment(taskId, req.user.id, {
        content,
        parentId,
      });

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get comments for a task
   * GET /api/v1/tasks/:taskId/comments
   */
  async getByTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const { cursor, limit, includeReplies } = req.query;

      const result = await commentService.getCommentsByTask(taskId, {
        cursor: cursor as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        includeReplies: includeReplies === 'true',
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get comment by ID
   * GET /api/v1/comments/:commentId
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params;

      const comment = await commentService.getCommentById(commentId);

      res.json({
        success: true,
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update comment
   * PATCH /api/v1/comments/:commentId
   */
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { commentId } = req.params;
      const { content } = req.body;

      const comment = await commentService.updateComment(commentId, req.user.id, content);

      res.json({
        success: true,
        message: 'Comment updated successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete comment
   * DELETE /api/v1/comments/:commentId
   */
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { commentId } = req.params;

      await commentService.deleteComment(commentId, req.user.id);

      res.json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get replies to a comment
   * GET /api/v1/comments/:commentId/replies
   */
  async getReplies(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params;
      const { cursor, limit } = req.query;

      const result = await commentService.getCommentReplies(commentId, {
        cursor: cursor as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add reaction to comment
   * POST /api/v1/comments/:commentId/reactions
   */
  async addReaction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { commentId } = req.params;
      const { emoji } = req.body;

      const reaction = await commentService.addReaction(commentId, req.user.id, emoji);

      res.status(201).json({
        success: true,
        message: 'Reaction added successfully',
        data: reaction,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove reaction from comment
   * DELETE /api/v1/comments/:commentId/reactions/:emoji
   */
  async removeReaction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { commentId, emoji } = req.params;

      await commentService.removeReaction(commentId, req.user.id, emoji);

      res.json({
        success: true,
        message: 'Reaction removed successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get reactions for comment
   * GET /api/v1/comments/:commentId/reactions
   */
  async getReactions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params;

      const reactions = await commentService.getCommentReactions(commentId);

      res.json({
        success: true,
        data: reactions,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Pin comment
   * POST /api/v1/comments/:commentId/pin
   */
  async pin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { commentId } = req.params;

      const comment = await commentService.pinComment(commentId, req.user.id);

      res.json({
        success: true,
        message: 'Comment pinned successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Unpin comment
   * DELETE /api/v1/comments/:commentId/pin
   */
  async unpin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { commentId } = req.params;

      const comment = await commentService.unpinComment(commentId, req.user.id);

      res.json({
        success: true,
        message: 'Comment unpinned successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Resolve comment thread
   * POST /api/v1/comments/:commentId/resolve
   */
  async resolve(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { commentId } = req.params;

      const comment = await commentService.resolveComment(commentId, req.user.id);

      res.json({
        success: true,
        message: 'Comment resolved successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Unresolve comment thread
   * DELETE /api/v1/comments/:commentId/resolve
   */
  async unresolve(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { commentId } = req.params;

      const comment = await commentService.unresolveComment(commentId, req.user.id);

      res.json({
        success: true,
        message: 'Comment unresolved successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Upload attachment to comment
   * POST /api/v1/comments/:commentId/attachments
   */
  async uploadAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { commentId } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        throw new AppError('No files provided', 400);
      }

      // For now, return a placeholder response
      // In production, this would upload to S3 and create attachment records
      res.status(201).json({
        success: true,
        message: 'Attachments uploaded successfully',
        data: {
          commentId,
          fileCount: files.length,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove attachment from comment
   * DELETE /api/v1/comments/:commentId/attachments/:attachmentId
   */
  async removeAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { commentId, attachmentId } = req.params;

      // For now, return a placeholder response
      // In production, this would delete from S3 and remove attachment records
      res.json({
        success: true,
        message: 'Attachment removed successfully',
        data: {
          commentId,
          attachmentId,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
