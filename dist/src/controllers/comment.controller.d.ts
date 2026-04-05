import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const commentController: {
    /**
     * Create a comment on a task
     * POST /api/v1/tasks/:taskId/comments
     */
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get comments for a task
     * GET /api/v1/tasks/:taskId/comments
     */
    getByTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get comment by ID
     * GET /api/v1/comments/:commentId
     */
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update comment
     * PATCH /api/v1/comments/:commentId
     */
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete comment
     * DELETE /api/v1/comments/:commentId
     */
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get replies to a comment
     * GET /api/v1/comments/:commentId/replies
     */
    getReplies(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Add reaction to comment
     * POST /api/v1/comments/:commentId/reactions
     */
    addReaction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Remove reaction from comment
     * DELETE /api/v1/comments/:commentId/reactions/:emoji
     */
    removeReaction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get reactions for comment
     * GET /api/v1/comments/:commentId/reactions
     */
    getReactions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Pin comment
     * POST /api/v1/comments/:commentId/pin
     */
    pin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Unpin comment
     * DELETE /api/v1/comments/:commentId/pin
     */
    unpin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Resolve comment thread
     * POST /api/v1/comments/:commentId/resolve
     */
    resolve(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Unresolve comment thread
     * DELETE /api/v1/comments/:commentId/resolve
     */
    unresolve(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Upload attachment to comment
     * POST /api/v1/comments/:commentId/attachments
     */
    uploadAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Remove attachment from comment
     * DELETE /api/v1/comments/:commentId/attachments/:attachmentId
     */
    removeAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=comment.controller.d.ts.map