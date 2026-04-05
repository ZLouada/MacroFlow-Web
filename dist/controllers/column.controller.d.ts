import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const columnController: {
    /**
     * Create a new column
     * POST /api/v1/projects/:projectId/columns
     */
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get columns for project
     * GET /api/v1/projects/:projectId/columns
     */
    getByProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get column by ID
     * GET /api/v1/columns/:columnId
     */
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update column
     * PATCH /api/v1/columns/:columnId
     */
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete column
     * DELETE /api/v1/columns/:columnId
     */
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Reorder column
     * POST /api/v1/columns/:columnId/reorder
     */
    reorder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Reorder all columns in project
     * POST /api/v1/projects/:projectId/columns/reorder
     */
    reorderAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get tasks in column
     * GET /api/v1/columns/:columnId/tasks
     */
    getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Set column WIP limit
     * PATCH /api/v1/columns/:columnId/wip-limit
     */
    setWipLimit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Set column color
     * PATCH /api/v1/columns/:columnId/color
     */
    setColor(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Collapse/expand column
     * POST /api/v1/columns/:columnId/toggle-collapse
     */
    toggleCollapse(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Clear all tasks from column
     * POST /api/v1/columns/:columnId/clear
     */
    clearTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=column.controller.d.ts.map