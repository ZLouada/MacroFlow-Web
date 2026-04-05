"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const comment_controller_js_1 = require("../controllers/comment.controller.js");
const error_middleware_js_1 = require("../middleware/error.middleware.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const rateLimit_middleware_js_1 = require("../middleware/rateLimit.middleware.js");
const comment_validation_js_1 = require("../validations/comment.validation.js");
const router = (0, express_1.Router)();
// Configure multer for attachment uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    },
});
// All routes require authentication
router.use(auth_middleware_js_1.authenticate);
// ===========================================
// Comment CRUD (Task Scoped)
// ===========================================
/**
 * @route   GET /api/v1/tasks/:taskId/comments
 * @desc    List comments on a task
 * @access  Private (Project Member)
 */
router.get('/tasks/:taskId/comments', (0, error_middleware_js_1.asyncHandler)(comment_controller_js_1.commentController.getByTask));
/**
 * @route   POST /api/v1/tasks/:taskId/comments
 * @desc    Create a comment on a task
 * @access  Private (Project Member)
 */
router.post('/tasks/:taskId/comments', (0, error_middleware_js_1.validate)({ body: comment_validation_js_1.createCommentSchema }), (0, error_middleware_js_1.asyncHandler)(comment_controller_js_1.commentController.create));
// ===========================================
// Individual Comment Operations
// ===========================================
/**
 * @route   GET /api/v1/comments/:commentId
 * @desc    Get comment details
 * @access  Private (Project Member)
 */
router.get('/:commentId', (0, error_middleware_js_1.asyncHandler)(comment_controller_js_1.commentController.getById));
/**
 * @route   PATCH /api/v1/comments/:commentId
 * @desc    Update comment
 * @access  Private (Comment Author)
 */
router.patch('/:commentId', (0, error_middleware_js_1.validate)({ body: comment_validation_js_1.updateCommentSchema }), (0, error_middleware_js_1.asyncHandler)(comment_controller_js_1.commentController.update));
/**
 * @route   DELETE /api/v1/comments/:commentId
 * @desc    Delete comment
 * @access  Private (Comment Author or Project Manager)
 */
router.delete('/:commentId', (0, error_middleware_js_1.asyncHandler)(comment_controller_js_1.commentController.delete));
// ===========================================
// Comment Reactions
// ===========================================
/**
 * @route   POST /api/v1/comments/:commentId/reactions
 * @desc    Add reaction to comment
 * @access  Private (Project Member)
 */
router.post('/:commentId/reactions', (0, error_middleware_js_1.asyncHandler)(comment_controller_js_1.commentController.addReaction));
/**
 * @route   DELETE /api/v1/comments/:commentId/reactions/:reaction
 * @desc    Remove reaction from comment
 * @access  Private (Project Member)
 */
router.delete('/:commentId/reactions/:reaction', (0, error_middleware_js_1.asyncHandler)(comment_controller_js_1.commentController.removeReaction));
// ===========================================
// Comment Attachments
// ===========================================
/**
 * @route   POST /api/v1/comments/:commentId/attachments
 * @desc    Upload attachment to comment
 * @access  Private (Comment Author)
 */
router.post('/:commentId/attachments', rateLimit_middleware_js_1.uploadRateLimiter, upload.array('files', 5), (0, error_middleware_js_1.asyncHandler)(comment_controller_js_1.commentController.uploadAttachment));
/**
 * @route   DELETE /api/v1/comments/:commentId/attachments/:attachmentId
 * @desc    Remove attachment from comment
 * @access  Private (Comment Author)
 */
router.delete('/:commentId/attachments/:attachmentId', (0, error_middleware_js_1.asyncHandler)(comment_controller_js_1.commentController.removeAttachment));
exports.default = router;
//# sourceMappingURL=comment.routes.js.map