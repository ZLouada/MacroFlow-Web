import { Router } from 'express';
import { taskController } from '../controllers/task.controller.js';
import { validate, asyncHandler } from '../middleware/error.middleware.js';
import { authenticate, requireProjectAccess } from '../middleware/auth.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  bulkUpdateTasksSchema,
  listTasksQuerySchema,
} from '../validations/task.validation.js';
import { ProjectRole } from '../types/index.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ===========================================
// Bulk Operations
// ===========================================

/**
 * @route   PATCH /api/v1/tasks/bulk
 * @desc    Bulk update tasks
 * @access  Private
 */
router.patch(
  '/bulk',
  validate({ body: bulkUpdateTasksSchema }),
  asyncHandler(taskController.bulkUpdate)
);

/**
 * @route   DELETE /api/v1/tasks/bulk
 * @desc    Bulk delete tasks
 * @access  Private
 */
router.delete(
  '/bulk',
  asyncHandler(taskController.bulkDelete)
);

// ===========================================
// Project-Scoped Task Operations
// ===========================================

/**
 * @route   GET /api/v1/projects/:projectId/tasks
 * @desc    List tasks in project with filters
 * @access  Private (Project Member)
 */
router.get(
  '/projects/:projectId/tasks',
  requireProjectAccess(),
  validate({ query: listTasksQuerySchema }),
  asyncHandler(taskController.getByProject)
);

/**
 * @route   POST /api/v1/projects/:projectId/tasks
 * @desc    Create a new task
 * @access  Private (Project Member)
 */
router.post(
  '/projects/:projectId/tasks',
  requireProjectAccess(ProjectRole.MANAGER, ProjectRole.MEMBER),
  validate({ body: createTaskSchema }),
  asyncHandler(taskController.create)
);

// ===========================================
// Individual Task Operations
// ===========================================

/**
 * @route   GET /api/v1/tasks/:taskId
 * @desc    Get task details
 * @access  Private (Project Member)
 */
router.get(
  '/:taskId',
  asyncHandler(taskController.getById)
);

/**
 * @route   PATCH /api/v1/tasks/:taskId
 * @desc    Update task
 * @access  Private (Project Member)
 */
router.patch(
  '/:taskId',
  validate({ body: updateTaskSchema }),
  asyncHandler(taskController.update)
);

/**
 * @route   DELETE /api/v1/tasks/:taskId
 * @desc    Delete task
 * @access  Private (Project Manager or Task Creator)
 */
router.delete(
  '/:taskId',
  asyncHandler(taskController.delete)
);

/**
 * @route   POST /api/v1/tasks/:taskId/move
 * @desc    Move task to different column/position
 * @access  Private (Project Member)
 */
router.post(
  '/:taskId/move',
  validate({ body: moveTaskSchema }),
  asyncHandler(taskController.move)
);

/**
 * @route   POST /api/v1/tasks/:taskId/reorder
 * @desc    Reorder task within column
 * @access  Private (Project Member)
 */
router.post(
  '/:taskId/reorder',
  asyncHandler(taskController.reorder)
);

/**
 * @route   POST /api/v1/tasks/:taskId/duplicate
 * @desc    Duplicate task
 * @access  Private (Project Member)
 */
router.post(
  '/:taskId/duplicate',
  asyncHandler(taskController.duplicate)
);

// ===========================================
// Task Assignment
// ===========================================

/**
 * @route   POST /api/v1/tasks/:taskId/assign
 * @desc    Assign task to user
 * @access  Private (Project Member)
 */
router.post(
  '/:taskId/assign',
  asyncHandler(taskController.assign)
);

/**
 * @route   POST /api/v1/tasks/:taskId/unassign
 * @desc    Unassign task
 * @access  Private (Project Member)
 */
router.post(
  '/:taskId/unassign',
  asyncHandler(taskController.unassign)
);

// ===========================================
// Task Labels
// ===========================================

/**
 * @route   POST /api/v1/tasks/:taskId/labels
 * @desc    Add label to task
 * @access  Private (Project Member)
 */
router.post(
  '/:taskId/labels',
  asyncHandler(taskController.addLabel)
);

/**
 * @route   DELETE /api/v1/tasks/:taskId/labels/:labelId
 * @desc    Remove label from task
 * @access  Private (Project Member)
 */
router.delete(
  '/:taskId/labels/:labelId',
  asyncHandler(taskController.removeLabel)
);

// ===========================================
// Task Dependencies
// ===========================================

/**
 * @route   POST /api/v1/tasks/:taskId/dependencies
 * @desc    Add task dependency
 * @access  Private (Project Member)
 */
router.post(
  '/:taskId/dependencies',
  asyncHandler(taskController.addDependency)
);

/**
 * @route   DELETE /api/v1/tasks/:taskId/dependencies/:dependencyId
 * @desc    Remove task dependency
 * @access  Private (Project Member)
 */
router.delete(
  '/:taskId/dependencies/:dependencyId',
  asyncHandler(taskController.removeDependency)
);

// ===========================================
// Task Subtasks
// ===========================================

/**
 * @route   GET /api/v1/tasks/:taskId/subtasks
 * @desc    Get task subtasks
 * @access  Private (Project Member)
 */
router.get(
  '/:taskId/subtasks',
  asyncHandler(taskController.getSubtasks)
);

/**
 * @route   POST /api/v1/tasks/:taskId/subtasks
 * @desc    Create subtask
 * @access  Private (Project Member)
 */
router.post(
  '/:taskId/subtasks',
  validate({ body: createTaskSchema }),
  asyncHandler(taskController.createSubtask)
);

// ===========================================
// Task Activity, Attachments & Comments
// ===========================================

/**
 * @route   GET /api/v1/tasks/:taskId/activity
 * @desc    Get task activity history
 * @access  Private (Project Member)
 */
router.get(
  '/:taskId/activity',
  asyncHandler(taskController.getActivity)
);

/**
 * @route   GET /api/v1/tasks/:taskId/attachments
 * @desc    Get task attachments
 * @access  Private (Project Member)
 */
router.get(
  '/:taskId/attachments',
  asyncHandler(taskController.getAttachments)
);

/**
 * @route   POST /api/v1/tasks/:taskId/attachments
 * @desc    Upload attachment to task
 * @access  Private (Project Member)
 */
router.post(
  '/:taskId/attachments',
  asyncHandler(taskController.uploadAttachment)
);

/**
 * @route   DELETE /api/v1/tasks/:taskId/attachments/:attachmentId
 * @desc    Delete attachment from task
 * @access  Private (Project Member)
 */
router.delete(
  '/:taskId/attachments/:attachmentId',
  asyncHandler(taskController.deleteAttachment)
);

/**
 * @route   GET /api/v1/tasks/:taskId/comments
 * @desc    Get task comments
 * @access  Private (Project Member)
 */
router.get(
  '/:taskId/comments',
  asyncHandler(taskController.getComments)
);

// ===========================================
// Task Watch & Time Tracking
// ===========================================

/**
 * @route   POST /api/v1/tasks/:taskId/watch
 * @desc    Watch/subscribe to task
 * @access  Private (Project Member)
 */
router.post(
  '/:taskId/watch',
  asyncHandler(taskController.watch)
);

/**
 * @route   DELETE /api/v1/tasks/:taskId/watch
 * @desc    Unwatch/unsubscribe from task
 * @access  Private (Project Member)
 */
router.delete(
  '/:taskId/watch',
  asyncHandler(taskController.unwatch)
);

/**
 * @route   GET /api/v1/tasks/:taskId/time-logs
 * @desc    Get time logs for task
 * @access  Private (Project Member)
 */
router.get(
  '/:taskId/time-logs',
  asyncHandler(taskController.getTimeLogs)
);

/**
 * @route   POST /api/v1/tasks/:taskId/time-logs
 * @desc    Log time on task
 * @access  Private (Project Member)
 */
router.post(
  '/:taskId/time-logs',
  asyncHandler(taskController.logTime)
);

export default router;
