import { Router } from 'express';
import { labelController } from '../controllers/label.controller.js';
import { validate, asyncHandler } from '../middleware/error.middleware.js';
import { authenticate, requireWorkspaceAccess, requireProjectAccess } from '../middleware/auth.middleware.js';
import {
  createLabelSchema,
  updateLabelSchema,
} from '../validations/comment.validation.js'; // Labels are in comment validation
import { WorkspaceRole, ProjectRole } from '../types/index.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ===========================================
// Workspace Labels
// ===========================================

/**
 * @route   GET /api/v1/workspaces/:workspaceId/labels
 * @desc    List workspace labels
 * @access  Private (Workspace Member)
 */
router.get(
  '/workspaces/:workspaceId/labels',
  requireWorkspaceAccess(),
  asyncHandler(labelController.getByWorkspace)
);

/**
 * @route   POST /api/v1/workspaces/:workspaceId/labels
 * @desc    Create workspace label
 * @access  Private (Workspace Admin)
 */
router.post(
  '/workspaces/:workspaceId/labels',
  requireWorkspaceAccess(WorkspaceRole.OWNER, WorkspaceRole.ADMIN),
  validate({ body: createLabelSchema }),
  asyncHandler(labelController.create)
);

// ===========================================
// Project Labels
// ===========================================

/**
 * @route   GET /api/v1/projects/:projectId/labels
 * @desc    List project labels
 * @access  Private (Project Member)
 */
router.get(
  '/projects/:projectId/labels',
  requireProjectAccess(),
  asyncHandler(labelController.getByProject)
);

/**
 * @route   POST /api/v1/projects/:projectId/labels
 * @desc    Create project label
 * @access  Private (Project Manager)
 */
router.post(
  '/projects/:projectId/labels',
  requireProjectAccess(ProjectRole.MANAGER),
  validate({ body: createLabelSchema }),
  asyncHandler(labelController.create)
);

// ===========================================
// Individual Label Operations
// ===========================================

/**
 * @route   GET /api/v1/labels/:labelId
 * @desc    Get label details
 * @access  Private
 */
router.get(
  '/:labelId',
  asyncHandler(labelController.getById)
);

/**
 * @route   PATCH /api/v1/labels/:labelId
 * @desc    Update label
 * @access  Private (Admin/Manager)
 */
router.patch(
  '/:labelId',
  validate({ body: updateLabelSchema }),
  asyncHandler(labelController.update)
);

/**
 * @route   DELETE /api/v1/labels/:labelId
 * @desc    Delete label
 * @access  Private (Admin/Manager)
 */
router.delete(
  '/:labelId',
  asyncHandler(labelController.delete)
);

export default router;
