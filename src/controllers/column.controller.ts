import { Response, NextFunction } from 'express';
import { columnService } from '../services/column.service';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../utils/errors';

export const columnController = {
  /**
   * Create a new column
   * POST /api/v1/projects/:projectId/columns
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { projectId } = req.params;

      const column = await columnService.createColumn(projectId, req.user.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Column created successfully',
        data: column,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get columns for project
   * GET /api/v1/projects/:projectId/columns
   */
  async getByProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;

      const columns = await columnService.getColumnsByProject(projectId);

      res.json({
        success: true,
        data: columns,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get column by ID
   * GET /api/v1/columns/:columnId
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { columnId } = req.params;

      const column = await columnService.getColumnById(columnId);

      res.json({
        success: true,
        data: column,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update column
   * PATCH /api/v1/columns/:columnId
   */
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { columnId } = req.params;

      const column = await columnService.updateColumn(columnId, req.user.id, req.body);

      res.json({
        success: true,
        message: 'Column updated successfully',
        data: column,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete column
   * DELETE /api/v1/columns/:columnId
   */
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { columnId } = req.params;
      const { moveTasksToColumnId } = req.query;

      await columnService.deleteColumn(
        columnId,
        req.user.id,
        moveTasksToColumnId as string | undefined
      );

      res.json({
        success: true,
        message: 'Column deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reorder column
   * POST /api/v1/columns/:columnId/reorder
   */
  async reorder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { columnId } = req.params;
      const { position } = req.body;

      const column = await columnService.reorderColumn(columnId, req.user.id, position);

      res.json({
        success: true,
        message: 'Column reordered successfully',
        data: column,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reorder all columns in project
   * POST /api/v1/projects/:projectId/columns/reorder
   */
  async reorderAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { projectId } = req.params;
      const { columnIds } = req.body;

      const columns = await columnService.reorderAllColumns(projectId, req.user.id, columnIds);

      res.json({
        success: true,
        message: 'Columns reordered successfully',
        data: columns,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get tasks in column
   * GET /api/v1/columns/:columnId/tasks
   */
  async getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { columnId } = req.params;
      const { cursor, limit } = req.query;

      const result = await columnService.getColumnTasks(columnId, {
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
   * Set column WIP limit
   * PATCH /api/v1/columns/:columnId/wip-limit
   */
  async setWipLimit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { columnId } = req.params;
      const { limit: wipLimit } = req.body;

      const column = await columnService.setWipLimit(columnId, req.user.id, wipLimit);

      res.json({
        success: true,
        message: 'WIP limit updated successfully',
        data: column,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Set column color
   * PATCH /api/v1/columns/:columnId/color
   */
  async setColor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { columnId } = req.params;
      const { color } = req.body;

      const column = await columnService.setColumnColor(columnId, req.user.id, color);

      res.json({
        success: true,
        message: 'Column color updated successfully',
        data: column,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Collapse/expand column
   * POST /api/v1/columns/:columnId/toggle-collapse
   */
  async toggleCollapse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { columnId } = req.params;
      const { collapsed } = req.body;

      const column = await columnService.toggleCollapse(columnId, req.user.id, collapsed);

      res.json({
        success: true,
        message: collapsed ? 'Column collapsed' : 'Column expanded',
        data: column,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Clear all tasks from column
   * POST /api/v1/columns/:columnId/clear
   */
  async clearTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { columnId } = req.params;
      const { archive } = req.body;

      const count = await columnService.clearColumn(columnId, req.user.id, archive);

      res.json({
        success: true,
        message: archive
          ? `${count} tasks archived successfully`
          : `${count} tasks deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  },
};
