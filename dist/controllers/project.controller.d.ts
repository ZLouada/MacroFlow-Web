import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const projectController: {
    /**
     * Create a new project
     * POST /api/v1/workspaces/:workspaceId/projects
     */
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get project by ID
     * GET /api/v1/projects/:projectId
     */
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update project
     * PATCH /api/v1/projects/:projectId
     */
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete project (soft delete)
     * DELETE /api/v1/projects/:projectId
     */
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get project members
     * GET /api/v1/projects/:projectId/members
     */
    getMembers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Add member to project
     * POST /api/v1/projects/:projectId/members
     */
    addMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update member role in project
     * PATCH /api/v1/projects/:projectId/members/:userId
     */
    updateMemberRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Remove member from project
     * DELETE /api/v1/projects/:projectId/members/:userId
     */
    removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get project tasks
     * GET /api/v1/projects/:projectId/tasks
     */
    getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get project board (Kanban view)
     * GET /api/v1/projects/:projectId/board
     */
    getBoard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get project Gantt data
     * GET /api/v1/projects/:projectId/gantt
     */
    getGantt(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get project activity
     * GET /api/v1/projects/:projectId/activity
     */
    getActivity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get project labels
     * GET /api/v1/projects/:projectId/labels
     */
    getLabels(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get project statistics
     * GET /api/v1/projects/:projectId/stats
     */
    getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Duplicate project
     * POST /api/v1/projects/:projectId/duplicate
     */
    duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Archive project
     * POST /api/v1/projects/:projectId/archive
     */
    archive(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Unarchive project
     * POST /api/v1/projects/:projectId/unarchive
     */
    unarchive(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update project settings
     * PATCH /api/v1/projects/:projectId/settings
     */
    updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=project.controller.d.ts.map