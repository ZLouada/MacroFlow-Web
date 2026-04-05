import { Response, NextFunction } from 'express';
import { labelService } from '../services/label.service';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../utils/errors';

export const labelController = {
  /**
   * Get all labels for a workspace
   * GET /api/v1/workspaces/:workspaceId/labels
   */
  async getByWorkspace(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;

      const labels = await labelService.listLabels(workspaceId);

      res.json({
        success: true,
        data: labels,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a label for a project
   * POST /api/v1/projects/:projectId/labels
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { projectId } = req.params;

      const label = await labelService.createLabel(projectId, req.user.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Label created successfully',
        data: label,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all labels for a project
   * GET /api/v1/projects/:projectId/labels
   */
  async getByProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;

      const labels = await labelService.getLabelsByProject(projectId);

      res.json({
        success: true,
        data: labels,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get label by ID
   * GET /api/v1/labels/:labelId
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { labelId } = req.params;

      const label = await labelService.getLabelById(labelId);

      res.json({
        success: true,
        data: label,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update label
   * PATCH /api/v1/labels/:labelId
   */
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { labelId } = req.params;

      const label = await labelService.updateLabel(labelId, req.user.id, req.body);

      res.json({
        success: true,
        message: 'Label updated successfully',
        data: label,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete label
   * DELETE /api/v1/labels/:labelId
   */
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { labelId } = req.params;

      await labelService.deleteLabel(labelId, req.user.id);

      res.json({
        success: true,
        message: 'Label deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get tasks with a specific label
   * GET /api/v1/labels/:labelId/tasks
   */
  async getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { labelId } = req.params;
      const { cursor, limit } = req.query;

      const result = await labelService.getTasksWithLabel(labelId, {
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
   * Merge labels
   * POST /api/v1/labels/:labelId/merge
   */
  async merge(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { labelId } = req.params;
      const { targetLabelId } = req.body;

      const label = await labelService.mergeLabels(labelId, targetLabelId, req.user.id);

      res.json({
        success: true,
        message: 'Labels merged successfully',
        data: label,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Bulk add labels to tasks
   * POST /api/v1/labels/:labelId/bulk-add
   */
  async bulkAdd(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { labelId } = req.params;
      const { taskIds } = req.body;

      const count = await labelService.bulkAddLabelToTasks(labelId, taskIds, req.user.id);

      res.json({
        success: true,
        message: `Label added to ${count} tasks`,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Bulk remove labels from tasks
   * POST /api/v1/labels/:labelId/bulk-remove
   */
  async bulkRemove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { labelId } = req.params;
      const { taskIds } = req.body;

      const count = await labelService.bulkRemoveLabelFromTasks(labelId, taskIds, req.user.id);

      res.json({
        success: true,
        message: `Label removed from ${count} tasks`,
      });
    } catch (error) {
      next(error);
    }
  },
};
