import { Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../utils/errors';

export const taskController = {
  /**
   * Get tasks by project
   * GET /api/v1/projects/:projectId/tasks
   */
  async getByProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { status, priority, assigneeId, labelIds, search, dueBefore, dueAfter, isMilestone, page, limit, sortBy, sortOrder } = req.query;

      const result = await taskService.getTasksByProject(projectId, {
        status: status as string | string[] | undefined,
        priority: priority as string | string[] | undefined,
        assigneeId: assigneeId as string | undefined,
        labelIds: labelIds as string | undefined,
        search: search as string | undefined,
        dueBefore: dueBefore as string | undefined,
        dueAfter: dueAfter as string | undefined,
        isMilestone: isMilestone as string | undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        sortBy: sortBy as string | undefined,
        sortOrder: sortOrder as 'asc' | 'desc' | undefined,
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
   * Create a new task
   * POST /api/v1/projects/:projectId/tasks
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { projectId } = req.params;

      const task = await taskService.createTask(projectId, req.user.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get task by ID
   * GET /api/v1/tasks/:taskId
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;

      const task = await taskService.getTaskById(taskId);

      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update task
   * PATCH /api/v1/tasks/:taskId
   */
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { taskId } = req.params;

      const task = await taskService.updateTask(taskId, req.user.id, req.body);

      res.json({
        success: true,
        message: 'Task updated successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete task (soft delete)
   * DELETE /api/v1/tasks/:taskId
   */
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;

      await taskService.deleteTask(taskId);

      res.json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Move task to column
   * POST /api/v1/tasks/:taskId/move
   */
  async move(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { taskId } = req.params;
      const { columnId, position } = req.body;

      const task = await taskService.moveTask(taskId, req.user.id, columnId, position);

      res.json({
        success: true,
        message: 'Task moved successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reorder task within column
   * POST /api/v1/tasks/:taskId/reorder
   */
  async reorder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { taskId } = req.params;
      const { position } = req.body;

      const task = await taskService.reorderTask(taskId, req.user.id, position);

      res.json({
        success: true,
        message: 'Task reordered successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Assign user to task
   * POST /api/v1/tasks/:taskId/assign
   */
  async assign(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { taskId } = req.params;
      const { userId } = req.body;

      const task = await taskService.assignTask(taskId, req.user.id, userId);

      res.json({
        success: true,
        message: 'User assigned to task successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Unassign user from task
   * POST /api/v1/tasks/:taskId/unassign
   */
  async unassign(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { taskId } = req.params;
      const { userId } = req.body;

      const task = await taskService.unassignTask(taskId, req.user.id, userId);

      res.json({
        success: true,
        message: 'User unassigned from task successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add label to task
   * POST /api/v1/tasks/:taskId/labels
   */
  async addLabel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { taskId } = req.params;
      const { labelId } = req.body;

      const task = await taskService.addLabelToTask(taskId, req.user.id, labelId);

      res.json({
        success: true,
        message: 'Label added to task successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove label from task
   * DELETE /api/v1/tasks/:taskId/labels/:labelId
   */
  async removeLabel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { taskId, labelId } = req.params;

      const task = await taskService.removeLabelFromTask(taskId, req.user.id, labelId);

      res.json({
        success: true,
        message: 'Label removed from task successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add dependency to task
   * POST /api/v1/tasks/:taskId/dependencies
   */
  async addDependency(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { taskId } = req.params;
      const { dependsOnId, type } = req.body;

      const task = await taskService.addDependency(taskId, req.user.id, dependsOnId, type);

      res.json({
        success: true,
        message: 'Dependency added successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove dependency from task
   * DELETE /api/v1/tasks/:taskId/dependencies/:dependencyId
   */
  async removeDependency(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { taskId, dependencyId } = req.params;

      const task = await taskService.removeDependency(taskId, req.user.id, dependencyId);

      res.json({
        success: true,
        message: 'Dependency removed successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get task comments
   * GET /api/v1/tasks/:taskId/comments
   */
  async getComments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const { cursor, limit } = req.query;

      const result = await taskService.getTaskComments(taskId, {
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
   * Get task attachments
   * GET /api/v1/tasks/:taskId/attachments
   */
  async getAttachments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;

      const attachments = await taskService.getTaskAttachments(taskId);

      res.json({
        success: true,
        data: attachments,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Upload attachment to task
   * POST /api/v1/tasks/:taskId/attachments
   */
  async uploadAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      const { taskId } = req.params;

      const attachment = await taskService.addAttachment(taskId, req.user.id, req.file);

      res.status(201).json({
        success: true,
        message: 'Attachment uploaded successfully',
        data: attachment,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete attachment from task
   * DELETE /api/v1/tasks/:taskId/attachments/:attachmentId
   */
  async deleteAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { taskId, attachmentId } = req.params;

      await taskService.deleteAttachment(taskId, attachmentId);

      res.json({
        success: true,
        message: 'Attachment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get task activity/history
   * GET /api/v1/tasks/:taskId/activity
   */
  async getActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const { cursor, limit } = req.query;

      const result = await taskService.getTaskActivity(taskId, {
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
   * Create subtask
   * POST /api/v1/tasks/:taskId/subtasks
   */
  async createSubtask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { taskId } = req.params;

      const subtask = await taskService.createSubtask(taskId, req.user.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Subtask created successfully',
        data: subtask,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get subtasks
   * GET /api/v1/tasks/:taskId/subtasks
   */
  async getSubtasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;

      const subtasks = await taskService.getSubtasks(taskId);

      res.json({
        success: true,
        data: subtasks,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Duplicate task
   * POST /api/v1/tasks/:taskId/duplicate
   */
  async duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { taskId } = req.params;
      const { includeSubtasks, includeComments, includeAttachments } = req.body;

      const task = await taskService.duplicateTask(taskId, req.user.id, {
        includeSubtasks,
        includeComments,
        includeAttachments,
      });

      res.status(201).json({
        success: true,
        message: 'Task duplicated successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Watch/subscribe to task
   * POST /api/v1/tasks/:taskId/watch
   */
  async watch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { taskId } = req.params;

      await taskService.watchTask(taskId, req.user.id);

      res.json({
        success: true,
        message: 'Now watching this task',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Unwatch/unsubscribe from task
   * DELETE /api/v1/tasks/:taskId/watch
   */
  async unwatch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { taskId } = req.params;

      await taskService.unwatchTask(taskId, req.user.id);

      res.json({
        success: true,
        message: 'Stopped watching this task',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Log time on task
   * POST /api/v1/tasks/:taskId/time-logs
   */
  async logTime(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { taskId } = req.params;
      const { minutes, description, date } = req.body;

      const timeLog = await taskService.logTime(taskId, req.user.id, {
        minutes,
        description,
        date,
      });

      res.status(201).json({
        success: true,
        message: 'Time logged successfully',
        data: timeLog,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get time logs for task
   * GET /api/v1/tasks/:taskId/time-logs
   */
  async getTimeLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const { cursor, limit, userId } = req.query;

      const result = await taskService.getTimeLogs(taskId, {
        cursor: cursor as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        userId: userId as string | undefined,
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
   * Bulk update tasks
   * PATCH /api/v1/tasks/bulk
   */
  async bulkUpdate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { taskIds, updates } = req.body;

      const tasks = await taskService.bulkUpdateTasks(taskIds, req.user.id, updates);

      res.json({
        success: true,
        message: `${tasks.length} tasks updated successfully`,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Bulk delete tasks
   * DELETE /api/v1/tasks/bulk
   */
  async bulkDelete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { taskIds } = req.body;

      const count = await taskService.bulkDeleteTasks(taskIds);

      res.json({
        success: true,
        message: `${count} tasks deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  },
};
