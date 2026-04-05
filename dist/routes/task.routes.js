"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_js_1 = require("../controllers/task.controller.js");
const error_middleware_js_1 = require("../middleware/error.middleware.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const task_validation_js_1 = require("../validations/task.validation.js");
const index_js_1 = require("../types/index.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authenticate);
// ===========================================
// Bulk Operations
// ===========================================
/**
 * @route   PATCH /api/v1/tasks/bulk
 * @desc    Bulk update tasks
 * @access  Private
 */
router.patch('/bulk', (0, error_middleware_js_1.validate)(task_validation_js_1.bulkUpdateTasksSchema), (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.bulkUpdate));
/**
 * @route   DELETE /api/v1/tasks/bulk
 * @desc    Bulk delete tasks
 * @access  Private
 */
router.delete('/bulk', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.bulkDelete));
// ===========================================
// Project-Scoped Task Operations
// ===========================================
/**
 * @route   GET /api/v1/projects/:projectId/tasks
 * @desc    List tasks in project with filters
 * @access  Private (Project Member)
 */
router.get('/projects/:projectId/tasks', (0, auth_middleware_js_1.requireProjectAccess)(), (0, error_middleware_js_1.validate)(task_validation_js_1.listTasksQuerySchema), (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.getByProject));
/**
 * @route   POST /api/v1/projects/:projectId/tasks
 * @desc    Create a new task
 * @access  Private (Project Member)
 */
router.post('/projects/:projectId/tasks', (0, auth_middleware_js_1.requireProjectAccess)([index_js_1.ProjectRole.MANAGER, index_js_1.ProjectRole.MEMBER]), (0, error_middleware_js_1.validate)(task_validation_js_1.createTaskSchema), (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.create));
// ===========================================
// Individual Task Operations
// ===========================================
/**
 * @route   GET /api/v1/tasks/:taskId
 * @desc    Get task details
 * @access  Private (Project Member)
 */
router.get('/:taskId', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.getById));
/**
 * @route   PATCH /api/v1/tasks/:taskId
 * @desc    Update task
 * @access  Private (Project Member)
 */
router.patch('/:taskId', (0, error_middleware_js_1.validate)(task_validation_js_1.updateTaskSchema), (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.update));
/**
 * @route   DELETE /api/v1/tasks/:taskId
 * @desc    Delete task
 * @access  Private (Project Manager or Task Creator)
 */
router.delete('/:taskId', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.delete));
/**
 * @route   POST /api/v1/tasks/:taskId/move
 * @desc    Move task to different column/position
 * @access  Private (Project Member)
 */
router.post('/:taskId/move', (0, error_middleware_js_1.validate)(task_validation_js_1.moveTaskSchema), (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.move));
/**
 * @route   POST /api/v1/tasks/:taskId/reorder
 * @desc    Reorder task within column
 * @access  Private (Project Member)
 */
router.post('/:taskId/reorder', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.reorder));
/**
 * @route   POST /api/v1/tasks/:taskId/duplicate
 * @desc    Duplicate task
 * @access  Private (Project Member)
 */
router.post('/:taskId/duplicate', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.duplicate));
// ===========================================
// Task Assignment
// ===========================================
/**
 * @route   POST /api/v1/tasks/:taskId/assign
 * @desc    Assign task to user
 * @access  Private (Project Member)
 */
router.post('/:taskId/assign', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.assign));
/**
 * @route   POST /api/v1/tasks/:taskId/unassign
 * @desc    Unassign task
 * @access  Private (Project Member)
 */
router.post('/:taskId/unassign', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.unassign));
// ===========================================
// Task Labels
// ===========================================
/**
 * @route   POST /api/v1/tasks/:taskId/labels
 * @desc    Add label to task
 * @access  Private (Project Member)
 */
router.post('/:taskId/labels', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.addLabel));
/**
 * @route   DELETE /api/v1/tasks/:taskId/labels/:labelId
 * @desc    Remove label from task
 * @access  Private (Project Member)
 */
router.delete('/:taskId/labels/:labelId', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.removeLabel));
// ===========================================
// Task Dependencies
// ===========================================
/**
 * @route   POST /api/v1/tasks/:taskId/dependencies
 * @desc    Add task dependency
 * @access  Private (Project Member)
 */
router.post('/:taskId/dependencies', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.addDependency));
/**
 * @route   DELETE /api/v1/tasks/:taskId/dependencies/:dependencyId
 * @desc    Remove task dependency
 * @access  Private (Project Member)
 */
router.delete('/:taskId/dependencies/:dependencyId', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.removeDependency));
// ===========================================
// Task Subtasks
// ===========================================
/**
 * @route   GET /api/v1/tasks/:taskId/subtasks
 * @desc    Get task subtasks
 * @access  Private (Project Member)
 */
router.get('/:taskId/subtasks', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.getSubtasks));
/**
 * @route   POST /api/v1/tasks/:taskId/subtasks
 * @desc    Create subtask
 * @access  Private (Project Member)
 */
router.post('/:taskId/subtasks', (0, error_middleware_js_1.validate)(task_validation_js_1.createTaskSchema), (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.createSubtask));
// ===========================================
// Task Activity, Attachments & Comments
// ===========================================
/**
 * @route   GET /api/v1/tasks/:taskId/activity
 * @desc    Get task activity history
 * @access  Private (Project Member)
 */
router.get('/:taskId/activity', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.getActivity));
/**
 * @route   GET /api/v1/tasks/:taskId/attachments
 * @desc    Get task attachments
 * @access  Private (Project Member)
 */
router.get('/:taskId/attachments', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.getAttachments));
/**
 * @route   POST /api/v1/tasks/:taskId/attachments
 * @desc    Upload attachment to task
 * @access  Private (Project Member)
 */
router.post('/:taskId/attachments', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.uploadAttachment));
/**
 * @route   DELETE /api/v1/tasks/:taskId/attachments/:attachmentId
 * @desc    Delete attachment from task
 * @access  Private (Project Member)
 */
router.delete('/:taskId/attachments/:attachmentId', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.deleteAttachment));
/**
 * @route   GET /api/v1/tasks/:taskId/comments
 * @desc    Get task comments
 * @access  Private (Project Member)
 */
router.get('/:taskId/comments', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.getComments));
// ===========================================
// Task Watch & Time Tracking
// ===========================================
/**
 * @route   POST /api/v1/tasks/:taskId/watch
 * @desc    Watch/subscribe to task
 * @access  Private (Project Member)
 */
router.post('/:taskId/watch', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.watch));
/**
 * @route   DELETE /api/v1/tasks/:taskId/watch
 * @desc    Unwatch/unsubscribe from task
 * @access  Private (Project Member)
 */
router.delete('/:taskId/watch', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.unwatch));
/**
 * @route   GET /api/v1/tasks/:taskId/time-logs
 * @desc    Get time logs for task
 * @access  Private (Project Member)
 */
router.get('/:taskId/time-logs', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.getTimeLogs));
/**
 * @route   POST /api/v1/tasks/:taskId/time-logs
 * @desc    Log time on task
 * @access  Private (Project Member)
 */
router.post('/:taskId/time-logs', (0, error_middleware_js_1.asyncHandler)(task_controller_js_1.taskController.logTime));
exports.default = router;
//# sourceMappingURL=task.routes.js.map