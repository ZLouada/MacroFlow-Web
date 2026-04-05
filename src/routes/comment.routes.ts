import { Router } from 'express';
import multer from 'multer';
import { commentController } from '../controllers/comment.controller.js';
import { validate, asyncHandler } from '../middleware/error.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadRateLimiter } from '../middleware/rateLimit.middleware.js';
import {
  createCommentSchema,
  updateCommentSchema,
} from '../validations/comment.validation.js';

const router = Router();

// Configure multer for attachment uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// All routes require authentication
router.use(authenticate);

// ===========================================
// Comment CRUD (Task Scoped)
// ===========================================

/**
 * @route   GET /api/v1/tasks/:taskId/comments
 * @desc    List comments on a task
 * @access  Private (Project Member)
 */
router.get(
  '/tasks/:taskId/comments',
  asyncHandler(commentController.getByTask)
);

/**
 * @route   POST /api/v1/tasks/:taskId/comments
 * @desc    Create a comment on a task
 * @access  Private (Project Member)
 */
router.post(
  '/tasks/:taskId/comments',
  validate({ body: createCommentSchema }),
  asyncHandler(commentController.create)
);

// ===========================================
// Individual Comment Operations
// ===========================================

/**
 * @route   GET /api/v1/comments/:commentId
 * @desc    Get comment details
 * @access  Private (Project Member)
 */
router.get(
  '/:commentId',
  asyncHandler(commentController.getById)
);

/**
 * @route   PATCH /api/v1/comments/:commentId
 * @desc    Update comment
 * @access  Private (Comment Author)
 */
router.patch(
  '/:commentId',
  validate({ body: updateCommentSchema }),
  asyncHandler(commentController.update)
);

/**
 * @route   DELETE /api/v1/comments/:commentId
 * @desc    Delete comment
 * @access  Private (Comment Author or Project Manager)
 */
router.delete(
  '/:commentId',
  asyncHandler(commentController.delete)
);

// ===========================================
// Comment Reactions
// ===========================================

/**
 * @route   POST /api/v1/comments/:commentId/reactions
 * @desc    Add reaction to comment
 * @access  Private (Project Member)
 */
router.post(
  '/:commentId/reactions',
  asyncHandler(commentController.addReaction)
);

/**
 * @route   DELETE /api/v1/comments/:commentId/reactions/:reaction
 * @desc    Remove reaction from comment
 * @access  Private (Project Member)
 */
router.delete(
  '/:commentId/reactions/:reaction',
  asyncHandler(commentController.removeReaction)
);

// ===========================================
// Comment Attachments
// ===========================================

/**
 * @route   POST /api/v1/comments/:commentId/attachments
 * @desc    Upload attachment to comment
 * @access  Private (Comment Author)
 */
router.post(
  '/:commentId/attachments',
  uploadRateLimiter,
  upload.array('files', 5),
  asyncHandler(commentController.uploadAttachment)
);

/**
 * @route   DELETE /api/v1/comments/:commentId/attachments/:attachmentId
 * @desc    Remove attachment from comment
 * @access  Private (Comment Author)
 */
router.delete(
  '/:commentId/attachments/:attachmentId',
  asyncHandler(commentController.removeAttachment)
);

export default router;
