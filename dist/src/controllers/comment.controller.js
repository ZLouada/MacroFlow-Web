"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentController = void 0;
const comment_service_1 = require("../services/comment.service");
const errors_1 = require("../utils/errors");
exports.commentController = {
    /**
     * Create a comment on a task
     * POST /api/v1/tasks/:taskId/comments
     */
    async create(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { taskId } = req.params;
            const { content, parentId } = req.body;
            const comment = await comment_service_1.commentService.createComment(taskId, req.user.id, {
                content,
                parentId,
            });
            res.status(201).json({
                success: true,
                message: 'Comment added successfully',
                data: comment,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get comments for a task
     * GET /api/v1/tasks/:taskId/comments
     */
    async getByTask(req, res, next) {
        try {
            const { taskId } = req.params;
            const { cursor, limit, includeReplies } = req.query;
            const result = await comment_service_1.commentService.getCommentsByTask(taskId, {
                cursor: cursor,
                limit: limit ? parseInt(limit, 10) : undefined,
                includeReplies: includeReplies === 'true',
            });
            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get comment by ID
     * GET /api/v1/comments/:commentId
     */
    async getById(req, res, next) {
        try {
            const { commentId } = req.params;
            const comment = await comment_service_1.commentService.getCommentById(commentId);
            res.json({
                success: true,
                data: comment,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Update comment
     * PATCH /api/v1/comments/:commentId
     */
    async update(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { commentId } = req.params;
            const { content } = req.body;
            const comment = await comment_service_1.commentService.updateComment(commentId, req.user.id, content);
            res.json({
                success: true,
                message: 'Comment updated successfully',
                data: comment,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Delete comment
     * DELETE /api/v1/comments/:commentId
     */
    async delete(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { commentId } = req.params;
            await comment_service_1.commentService.deleteComment(commentId, req.user.id);
            res.json({
                success: true,
                message: 'Comment deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get replies to a comment
     * GET /api/v1/comments/:commentId/replies
     */
    async getReplies(req, res, next) {
        try {
            const { commentId } = req.params;
            const { cursor, limit } = req.query;
            const result = await comment_service_1.commentService.getCommentReplies(commentId, {
                cursor: cursor,
                limit: limit ? parseInt(limit, 10) : undefined,
            });
            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Add reaction to comment
     * POST /api/v1/comments/:commentId/reactions
     */
    async addReaction(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { commentId } = req.params;
            const { emoji } = req.body;
            const reaction = await comment_service_1.commentService.addReaction(commentId, req.user.id, emoji);
            res.status(201).json({
                success: true,
                message: 'Reaction added successfully',
                data: reaction,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Remove reaction from comment
     * DELETE /api/v1/comments/:commentId/reactions/:emoji
     */
    async removeReaction(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { commentId, emoji } = req.params;
            await comment_service_1.commentService.removeReaction(commentId, req.user.id, emoji);
            res.json({
                success: true,
                message: 'Reaction removed successfully',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get reactions for comment
     * GET /api/v1/comments/:commentId/reactions
     */
    async getReactions(req, res, next) {
        try {
            const { commentId } = req.params;
            const reactions = await comment_service_1.commentService.getCommentReactions(commentId);
            res.json({
                success: true,
                data: reactions,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Pin comment
     * POST /api/v1/comments/:commentId/pin
     */
    async pin(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { commentId } = req.params;
            const comment = await comment_service_1.commentService.pinComment(commentId, req.user.id);
            res.json({
                success: true,
                message: 'Comment pinned successfully',
                data: comment,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Unpin comment
     * DELETE /api/v1/comments/:commentId/pin
     */
    async unpin(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { commentId } = req.params;
            const comment = await comment_service_1.commentService.unpinComment(commentId, req.user.id);
            res.json({
                success: true,
                message: 'Comment unpinned successfully',
                data: comment,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Resolve comment thread
     * POST /api/v1/comments/:commentId/resolve
     */
    async resolve(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { commentId } = req.params;
            const comment = await comment_service_1.commentService.resolveComment(commentId, req.user.id);
            res.json({
                success: true,
                message: 'Comment resolved successfully',
                data: comment,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Unresolve comment thread
     * DELETE /api/v1/comments/:commentId/resolve
     */
    async unresolve(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { commentId } = req.params;
            const comment = await comment_service_1.commentService.unresolveComment(commentId, req.user.id);
            res.json({
                success: true,
                message: 'Comment unresolved successfully',
                data: comment,
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=comment.controller.js.map