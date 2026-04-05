import { Router } from 'express';
import { columnController } from '../controllers/column.controller';
import { validate, asyncHandler } from '../middleware/error.middleware';
import { authenticate, requireProjectAccess } from '../middleware/auth.middleware';
import {
  createColumnSchema,
  updateColumnSchema,
  reorderColumnsSchema,
} from '../validations/column.validation';
import { ProjectRole } from '../types/index';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ===========================================
// Column CRUD (Project Scoped)
// ===========================================

/**
 * @route   GET /api/v1/projects/:projectId/columns
 * @desc    List columns in project (Kanban board)
 * @access  Private (Project Member)
 */
router.get(
  '/projects/:projectId/columns',
  requireProjectAccess(),
  asyncHandler(columnController.getByProject)
);

/**
 * @route   POST /api/v1/projects/:projectId/columns
 * @desc    Create a new column
 * @access  Private (Project Manager)
 */
router.post(
  '/projects/:projectId/columns',
  requireProjectAccess(ProjectRole.MANAGER),
  validate({ body: createColumnSchema }),
  asyncHandler(columnController.create)
);

/**
 * @route   POST /api/v1/projects/:projectId/columns/reorder
 * @desc    Reorder columns
 * @access  Private (Project Manager)
 */
router.post(
  '/projects/:projectId/columns/reorder',
  requireProjectAccess(ProjectRole.MANAGER),
  validate({ body: reorderColumnsSchema }),
  asyncHandler(columnController.reorderAll)
);

// ===========================================
// Individual Column Operations
// ===========================================

/**
 * @route   GET /api/v1/columns/:columnId
 * @desc    Get column with tasks
 * @access  Private (Project Member)
 */
router.get(
  '/:columnId',
  asyncHandler(columnController.getById)
);

/**
 * @route   PATCH /api/v1/columns/:columnId
 * @desc    Update column
 * @access  Private (Project Manager)
 */
router.patch(
  '/:columnId',
  validate({ body: updateColumnSchema }),
  asyncHandler(columnController.update)
);

/**
 * @route   DELETE /api/v1/columns/:columnId
 * @desc    Delete column
 * @access  Private (Project Manager)
 */
router.delete(
  '/:columnId',
  asyncHandler(columnController.delete)
);

/**
 * @route   POST /api/v1/columns/:columnId/clear
 * @desc    Clear all tasks in column
 * @access  Private (Project Manager)
 */
router.post(
  '/:columnId/clear',
  asyncHandler(columnController.clearTasks)
);

export default router;
