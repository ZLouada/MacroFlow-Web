import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const labelController: {
    /**
     * Get all labels for a workspace
     * GET /api/v1/workspaces/:workspaceId/labels
     */
    getByWorkspace(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Create a label for a project
     * POST /api/v1/projects/:projectId/labels
     */
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get all labels for a project
     * GET /api/v1/projects/:projectId/labels
     */
    getByProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get label by ID
     * GET /api/v1/labels/:labelId
     */
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update label
     * PATCH /api/v1/labels/:labelId
     */
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete label
     * DELETE /api/v1/labels/:labelId
     */
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get tasks with a specific label
     * GET /api/v1/labels/:labelId/tasks
     */
    getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Merge labels
     * POST /api/v1/labels/:labelId/merge
     */
    merge(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Bulk add labels to tasks
     * POST /api/v1/labels/:labelId/bulk-add
     */
    bulkAdd(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Bulk remove labels from tasks
     * POST /api/v1/labels/:labelId/bulk-remove
     */
    bulkRemove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=label.controller.d.ts.map