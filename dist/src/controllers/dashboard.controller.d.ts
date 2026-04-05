import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const dashboardController: {
    /**
     * Get workspace dashboard overview
     * GET /api/v1/workspaces/:workspaceId/dashboard
     */
    getWorkspaceDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get project dashboard overview
     * GET /api/v1/projects/:projectId/dashboard
     */
    getProjectDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get user's personal dashboard
     * GET /api/v1/dashboard
     */
    getPersonalDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get task summary (counts by status, priority, etc.)
     * GET /api/v1/workspaces/:workspaceId/analytics/tasks
     */
    getTaskSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get velocity metrics (tasks completed per sprint/week)
     * GET /api/v1/projects/:projectId/analytics/velocity
     */
    getVelocity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get burndown chart data
     * GET /api/v1/projects/:projectId/analytics/burndown
     */
    getBurndown(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get workload distribution by team member
     * GET /api/v1/workspaces/:workspaceId/analytics/workload
     */
    getWorkload(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get activity timeline
     * GET /api/v1/workspaces/:workspaceId/analytics/activity
     */
    getActivityTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get overdue tasks
     * GET /api/v1/workspaces/:workspaceId/analytics/overdue
     */
    getOverdueTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get upcoming deadlines
     * GET /api/v1/workspaces/:workspaceId/analytics/upcoming
     */
    getUpcomingDeadlines(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get completion rate trends
     * GET /api/v1/projects/:projectId/analytics/completion
     */
    getCompletionRate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get cycle time analysis
     * GET /api/v1/projects/:projectId/analytics/cycle-time
     */
    getCycleTime(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get label usage statistics
     * GET /api/v1/projects/:projectId/analytics/labels
     */
    getLabelStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Export analytics report
     * GET /api/v1/workspaces/:workspaceId/analytics/export
     */
    exportReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=dashboard.controller.d.ts.map