"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskController = void 0;
const task_service_1 = require("../services/task.service");
const errors_1 = require("../utils/errors");
exports.taskController = {
    /**
     * Get tasks by project
     * GET /api/v1/projects/:projectId/tasks
     */
    async getByProject(req, res, next) {
        try {
            const { projectId } = req.params;
            const { status, priority, assigneeId, labelIds, search, dueBefore, dueAfter, isMilestone, page, limit, sortBy, sortOrder } = req.query;
            const result = await task_service_1.taskService.getTasksByProject(projectId, {
                status: status,
                priority: priority,
                assigneeId: assigneeId,
                labelIds: labelIds,
                search: search,
                dueBefore: dueBefore,
                dueAfter: dueAfter,
                isMilestone: isMilestone,
                page: page ? parseInt(page, 10) : undefined,
                limit: limit ? parseInt(limit, 10) : undefined,
                sortBy: sortBy,
                sortOrder: sortOrder,
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
     * Create a new task
     * POST /api/v1/projects/:projectId/tasks
     */
    async create(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { projectId } = req.params;
            const task = await task_service_1.taskService.createTask(projectId, req.user.id, req.body);
            res.status(201).json({
                success: true,
                message: 'Task created successfully',
                data: task,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get task by ID
     * GET /api/v1/tasks/:taskId
     */
    async getById(req, res, next) {
        try {
            const { taskId } = req.params;
            const task = await task_service_1.taskService.getTaskById(taskId);
            res.json({
                success: true,
                data: task,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Update task
     * PATCH /api/v1/tasks/:taskId
     */
    async update(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { taskId } = req.params;
            const task = await task_service_1.taskService.updateTask(taskId, req.user.id, req.body);
            res.json({
                success: true,
                message: 'Task updated successfully',
                data: task,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Delete task (soft delete)
     * DELETE /api/v1/tasks/:taskId
     */
    async delete(req, res, next) {
        try {
            const { taskId } = req.params;
            await task_service_1.taskService.deleteTask(taskId);
            res.json({
                success: true,
                message: 'Task deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Move task to column
     * POST /api/v1/tasks/:taskId/move
     */
    async move(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { taskId } = req.params;
            const { columnId, position } = req.body;
            const task = await task_service_1.taskService.moveTask(taskId, req.user.id, columnId, position);
            res.json({
                success: true,
                message: 'Task moved successfully',
                data: task,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Reorder task within column
     * POST /api/v1/tasks/:taskId/reorder
     */
    async reorder(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { taskId } = req.params;
            const { position } = req.body;
            const task = await task_service_1.taskService.reorderTask(taskId, req.user.id, position);
            res.json({
                success: true,
                message: 'Task reordered successfully',
                data: task,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Assign user to task
     * POST /api/v1/tasks/:taskId/assign
     */
    async assign(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { taskId } = req.params;
            const { userId } = req.body;
            const task = await task_service_1.taskService.assignTask(taskId, req.user.id, userId);
            res.json({
                success: true,
                message: 'User assigned to task successfully',
                data: task,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Unassign user from task
     * POST /api/v1/tasks/:taskId/unassign
     */
    async unassign(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { taskId } = req.params;
            const { userId } = req.body;
            const task = await task_service_1.taskService.unassignTask(taskId, req.user.id, userId);
            res.json({
                success: true,
                message: 'User unassigned from task successfully',
                data: task,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Add label to task
     * POST /api/v1/tasks/:taskId/labels
     */
    async addLabel(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { taskId } = req.params;
            const { labelId } = req.body;
            const task = await task_service_1.taskService.addLabelToTask(taskId, req.user.id, labelId);
            res.json({
                success: true,
                message: 'Label added to task successfully',
                data: task,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Remove label from task
     * DELETE /api/v1/tasks/:taskId/labels/:labelId
     */
    async removeLabel(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { taskId, labelId } = req.params;
            const task = await task_service_1.taskService.removeLabelFromTask(taskId, req.user.id, labelId);
            res.json({
                success: true,
                message: 'Label removed from task successfully',
                data: task,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Add dependency to task
     * POST /api/v1/tasks/:taskId/dependencies
     */
    async addDependency(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { taskId } = req.params;
            const { dependsOnId, type } = req.body;
            const task = await task_service_1.taskService.addDependency(taskId, req.user.id, dependsOnId, type);
            res.json({
                success: true,
                message: 'Dependency added successfully',
                data: task,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Remove dependency from task
     * DELETE /api/v1/tasks/:taskId/dependencies/:dependencyId
     */
    async removeDependency(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { taskId, dependencyId } = req.params;
            const task = await task_service_1.taskService.removeDependency(taskId, req.user.id, dependencyId);
            res.json({
                success: true,
                message: 'Dependency removed successfully',
                data: task,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get task comments
     * GET /api/v1/tasks/:taskId/comments
     */
    async getComments(req, res, next) {
        try {
            const { taskId } = req.params;
            const { cursor, limit } = req.query;
            const result = await task_service_1.taskService.getTaskComments(taskId, {
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
     * Get task attachments
     * GET /api/v1/tasks/:taskId/attachments
     */
    async getAttachments(req, res, next) {
        try {
            const { taskId } = req.params;
            const attachments = await task_service_1.taskService.getTaskAttachments(taskId);
            res.json({
                success: true,
                data: attachments,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Upload attachment to task
     * POST /api/v1/tasks/:taskId/attachments
     */
    async uploadAttachment(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            if (!req.file) {
                throw new errors_1.AppError('No file uploaded', 400);
            }
            const { taskId } = req.params;
            const attachment = await task_service_1.taskService.addAttachment(taskId, req.user.id, req.file);
            res.status(201).json({
                success: true,
                message: 'Attachment uploaded successfully',
                data: attachment,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Delete attachment from task
     * DELETE /api/v1/tasks/:taskId/attachments/:attachmentId
     */
    async deleteAttachment(req, res, next) {
        try {
            const { taskId, attachmentId } = req.params;
            await task_service_1.taskService.deleteAttachment(taskId, attachmentId);
            res.json({
                success: true,
                message: 'Attachment deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get task activity/history
     * GET /api/v1/tasks/:taskId/activity
     */
    async getActivity(req, res, next) {
        try {
            const { taskId } = req.params;
            const { cursor, limit } = req.query;
            const result = await task_service_1.taskService.getTaskActivity(taskId, {
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
     * Create subtask
     * POST /api/v1/tasks/:taskId/subtasks
     */
    async createSubtask(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { taskId } = req.params;
            const subtask = await task_service_1.taskService.createSubtask(taskId, req.user.id, req.body);
            res.status(201).json({
                success: true,
                message: 'Subtask created successfully',
                data: subtask,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get subtasks
     * GET /api/v1/tasks/:taskId/subtasks
     */
    async getSubtasks(req, res, next) {
        try {
            const { taskId } = req.params;
            const subtasks = await task_service_1.taskService.getSubtasks(taskId);
            res.json({
                success: true,
                data: subtasks,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Duplicate task
     * POST /api/v1/tasks/:taskId/duplicate
     */
    async duplicate(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { taskId } = req.params;
            const { includeSubtasks, includeComments, includeAttachments } = req.body;
            const task = await task_service_1.taskService.duplicateTask(taskId, req.user.id, {
                includeSubtasks,
                includeComments,
                includeAttachments,
            });
            res.status(201).json({
                success: true,
                message: 'Task duplicated successfully',
                data: task,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Watch/subscribe to task
     * POST /api/v1/tasks/:taskId/watch
     */
    async watch(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { taskId } = req.params;
            await task_service_1.taskService.watchTask(taskId, req.user.id);
            res.json({
                success: true,
                message: 'Now watching this task',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Unwatch/unsubscribe from task
     * DELETE /api/v1/tasks/:taskId/watch
     */
    async unwatch(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { taskId } = req.params;
            await task_service_1.taskService.unwatchTask(taskId, req.user.id);
            res.json({
                success: true,
                message: 'Stopped watching this task',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Log time on task
     * POST /api/v1/tasks/:taskId/time-logs
     */
    async logTime(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { taskId } = req.params;
            const { minutes, description, date } = req.body;
            const timeLog = await task_service_1.taskService.logTime(taskId, req.user.id, {
                minutes,
                description,
                date,
            });
            res.status(201).json({
                success: true,
                message: 'Time logged successfully',
                data: timeLog,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get time logs for task
     * GET /api/v1/tasks/:taskId/time-logs
     */
    async getTimeLogs(req, res, next) {
        try {
            const { taskId } = req.params;
            const { cursor, limit, userId } = req.query;
            const result = await task_service_1.taskService.getTimeLogs(taskId, {
                cursor: cursor,
                limit: limit ? parseInt(limit, 10) : undefined,
                userId: userId,
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
     * Bulk update tasks
     * PATCH /api/v1/tasks/bulk
     */
    async bulkUpdate(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { taskIds, updates } = req.body;
            const tasks = await task_service_1.taskService.bulkUpdateTasks(taskIds, req.user.id, updates);
            res.json({
                success: true,
                message: `${tasks.length} tasks updated successfully`,
                data: tasks,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Bulk delete tasks
     * DELETE /api/v1/tasks/bulk
     */
    async bulkDelete(req, res, next) {
        try {
            const { taskIds } = req.body;
            const count = await task_service_1.taskService.bulkDeleteTasks(taskIds);
            res.json({
                success: true,
                message: `${count} tasks deleted successfully`,
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=task.controller.js.map