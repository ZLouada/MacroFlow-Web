import { Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../utils/errors';

export const dashboardController = {
  /**
   * Get workspace dashboard overview
   * GET /api/v1/workspaces/:workspaceId/dashboard
   */
  async getWorkspaceDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;

      const dashboard = await dashboardService.getWorkspaceDashboard(workspaceId);

      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get project dashboard overview
   * GET /api/v1/projects/:projectId/dashboard
   */
  async getProjectDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;

      const dashboard = await dashboardService.getProjectDashboard(projectId);

      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user's personal dashboard
   * GET /api/v1/dashboard
   */
  async getPersonalDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const dashboard = await dashboardService.getPersonalDashboard(req.user.id);

      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user's tasks across all projects
   * GET /api/v1/dashboard/tasks
   */
  async getMyTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { limit } = req.query;

      const tasks = await dashboardService.getMyTasks(
        req.user.id,
        limit ? parseInt(limit as string, 10) : 20
      );

      res.json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get task summary (counts by status, priority, etc.)
   * GET /api/v1/workspaces/:workspaceId/analytics/tasks
   */
  async getTaskSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const { projectId, startDate, endDate } = req.query;

      const summary = await dashboardService.getTaskSummary(workspaceId, {
        projectId: projectId as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      });

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get velocity metrics (tasks completed per sprint/week)
   * GET /api/v1/projects/:projectId/analytics/velocity
   */
  async getVelocity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { period, count } = req.query;

      const velocity = await dashboardService.getVelocityMetrics(projectId, {
        period: (period as 'day' | 'week' | 'month') || 'week',
        count: count ? parseInt(count as string, 10) : 8,
      });

      res.json({
        success: true,
        data: velocity,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get burndown chart data
   * GET /api/v1/projects/:projectId/analytics/burndown
   */
  async getBurndown(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { startDate, endDate } = req.query;

      const burndown = await dashboardService.getBurndownChart(projectId, {
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json({
        success: true,
        data: burndown,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get workload distribution by team member
   * GET /api/v1/workspaces/:workspaceId/analytics/workload
   */
  async getWorkload(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const { projectId } = req.query;

      const workload = await dashboardService.getWorkloadDistribution(workspaceId, {
        projectId: projectId as string | undefined,
      });

      res.json({
        success: true,
        data: workload,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get activity timeline
   * GET /api/v1/workspaces/:workspaceId/analytics/activity
   */
  async getActivityTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const { projectId, days } = req.query;

      const activity = await dashboardService.getActivityTimeline(workspaceId, {
        projectId: projectId as string | undefined,
        days: days ? parseInt(days as string, 10) : 30,
      });

      res.json({
        success: true,
        data: activity,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get overdue tasks
   * GET /api/v1/workspaces/:workspaceId/analytics/overdue
   */
  async getOverdueTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const { projectId, cursor, limit } = req.query;

      const result = await dashboardService.getOverdueTasks(workspaceId, {
        projectId: projectId as string | undefined,
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
   * Get upcoming deadlines
   * GET /api/v1/workspaces/:workspaceId/analytics/upcoming
   */
  async getUpcomingDeadlines(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const { projectId, days, cursor, limit } = req.query;

      const result = await dashboardService.getUpcomingDeadlines(workspaceId, {
        projectId: projectId as string | undefined,
        days: days ? parseInt(days as string, 10) : 7,
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
   * Get completion rate trends
   * GET /api/v1/projects/:projectId/analytics/completion
   */
  async getCompletionRate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { period, count } = req.query;

      const completion = await dashboardService.getCompletionRate(projectId, {
        period: (period as 'day' | 'week' | 'month') || 'week',
        count: count ? parseInt(count as string, 10) : 12,
      });

      res.json({
        success: true,
        data: completion,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get cycle time analysis
   * GET /api/v1/projects/:projectId/analytics/cycle-time
   */
  async getCycleTime(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { startDate, endDate } = req.query;

      const cycleTime = await dashboardService.getCycleTimeAnalysis(projectId, {
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      });

      res.json({
        success: true,
        data: cycleTime,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get label usage statistics
   * GET /api/v1/projects/:projectId/analytics/labels
   */
  async getLabelStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;

      const stats = await dashboardService.getLabelStats(projectId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Export analytics report
   * GET /api/v1/workspaces/:workspaceId/analytics/export
   */
  async exportReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const { projectId, format, startDate, endDate } = req.query;

      const report = await dashboardService.exportAnalyticsReport(workspaceId, {
        projectId: projectId as string | undefined,
        format: (format as 'csv' | 'json' | 'pdf') || 'csv',
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      });

      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-${workspaceId}.pdf`);
      } else if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=report-${workspaceId}.csv`);
      }

      res.send(report);
    } catch (error) {
      next(error);
    }
  },
};
