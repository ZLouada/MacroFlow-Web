"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const errors_1 = require("../utils/errors");
exports.dashboardController = {
    /**
     * Get workspace dashboard overview
     * GET /api/v1/workspaces/:workspaceId/dashboard
     */
    async getWorkspaceDashboard(req, res, next) {
        try {
            const { workspaceId } = req.params;
            const dashboard = await dashboard_service_1.dashboardService.getWorkspaceDashboard(workspaceId);
            res.json({
                success: true,
                data: dashboard,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get project dashboard overview
     * GET /api/v1/projects/:projectId/dashboard
     */
    async getProjectDashboard(req, res, next) {
        try {
            const { projectId } = req.params;
            const dashboard = await dashboard_service_1.dashboardService.getProjectDashboard(projectId);
            res.json({
                success: true,
                data: dashboard,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get user's personal dashboard
     * GET /api/v1/dashboard
     */
    async getPersonalDashboard(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const dashboard = await dashboard_service_1.dashboardService.getPersonalDashboard(req.user.id);
            res.json({
                success: true,
                data: dashboard,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get user's tasks across all projects
     * GET /api/v1/dashboard/tasks
     */
    async getMyTasks(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { limit } = req.query;
            const tasks = await dashboard_service_1.dashboardService.getMyTasks(req.user.id, limit ? parseInt(limit, 10) : 20);
            res.json({
                success: true,
                data: tasks,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get task summary (counts by status, priority, etc.)
     * GET /api/v1/workspaces/:workspaceId/analytics/tasks
     */
    async getTaskSummary(req, res, next) {
        try {
            const { workspaceId } = req.params;
            const { projectId, startDate, endDate } = req.query;
            const summary = await dashboard_service_1.dashboardService.getTaskSummary(workspaceId, {
                projectId: projectId,
                startDate: startDate,
                endDate: endDate,
            });
            res.json({
                success: true,
                data: summary,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get velocity metrics (tasks completed per sprint/week)
     * GET /api/v1/projects/:projectId/analytics/velocity
     */
    async getVelocity(req, res, next) {
        try {
            const { projectId } = req.params;
            const { period, count } = req.query;
            const velocity = await dashboard_service_1.dashboardService.getVelocityMetrics(projectId, {
                period: period || 'week',
                count: count ? parseInt(count, 10) : 8,
            });
            res.json({
                success: true,
                data: velocity,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get burndown chart data
     * GET /api/v1/projects/:projectId/analytics/burndown
     */
    async getBurndown(req, res, next) {
        try {
            const { projectId } = req.params;
            const { startDate, endDate } = req.query;
            const burndown = await dashboard_service_1.dashboardService.getBurndownChart(projectId, {
                startDate: startDate,
                endDate: endDate,
            });
            res.json({
                success: true,
                data: burndown,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get workload distribution by team member
     * GET /api/v1/workspaces/:workspaceId/analytics/workload
     */
    async getWorkload(req, res, next) {
        try {
            const { workspaceId } = req.params;
            const { projectId } = req.query;
            const workload = await dashboard_service_1.dashboardService.getWorkloadDistribution(workspaceId, {
                projectId: projectId,
            });
            res.json({
                success: true,
                data: workload,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get activity timeline
     * GET /api/v1/workspaces/:workspaceId/analytics/activity
     */
    async getActivityTimeline(req, res, next) {
        try {
            const { workspaceId } = req.params;
            const { projectId, days } = req.query;
            const activity = await dashboard_service_1.dashboardService.getActivityTimeline(workspaceId, {
                projectId: projectId,
                days: days ? parseInt(days, 10) : 30,
            });
            res.json({
                success: true,
                data: activity,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get overdue tasks
     * GET /api/v1/workspaces/:workspaceId/analytics/overdue
     */
    async getOverdueTasks(req, res, next) {
        try {
            const { workspaceId } = req.params;
            const { projectId, cursor, limit } = req.query;
            const result = await dashboard_service_1.dashboardService.getOverdueTasks(workspaceId, {
                projectId: projectId,
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
     * Get upcoming deadlines
     * GET /api/v1/workspaces/:workspaceId/analytics/upcoming
     */
    async getUpcomingDeadlines(req, res, next) {
        try {
            const { workspaceId } = req.params;
            const { projectId, days, cursor, limit } = req.query;
            const result = await dashboard_service_1.dashboardService.getUpcomingDeadlines(workspaceId, {
                projectId: projectId,
                days: days ? parseInt(days, 10) : 7,
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
     * Get completion rate trends
     * GET /api/v1/projects/:projectId/analytics/completion
     */
    async getCompletionRate(req, res, next) {
        try {
            const { projectId } = req.params;
            const { period, count } = req.query;
            const completion = await dashboard_service_1.dashboardService.getCompletionRate(projectId, {
                period: period || 'week',
                count: count ? parseInt(count, 10) : 12,
            });
            res.json({
                success: true,
                data: completion,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get cycle time analysis
     * GET /api/v1/projects/:projectId/analytics/cycle-time
     */
    async getCycleTime(req, res, next) {
        try {
            const { projectId } = req.params;
            const { startDate, endDate } = req.query;
            const cycleTime = await dashboard_service_1.dashboardService.getCycleTimeAnalysis(projectId, {
                startDate: startDate,
                endDate: endDate,
            });
            res.json({
                success: true,
                data: cycleTime,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get label usage statistics
     * GET /api/v1/projects/:projectId/analytics/labels
     */
    async getLabelStats(req, res, next) {
        try {
            const { projectId } = req.params;
            const stats = await dashboard_service_1.dashboardService.getLabelStats(projectId);
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Export analytics report
     * GET /api/v1/workspaces/:workspaceId/analytics/export
     */
    async exportReport(req, res, next) {
        try {
            const { workspaceId } = req.params;
            const { projectId, format, startDate, endDate } = req.query;
            const report = await dashboard_service_1.dashboardService.exportAnalyticsReport(workspaceId, {
                projectId: projectId,
                format: format || 'csv',
                startDate: startDate,
                endDate: endDate,
            });
            if (format === 'pdf') {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=report-${workspaceId}.pdf`);
            }
            else if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=report-${workspaceId}.csv`);
            }
            res.send(report);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=dashboard.controller.js.map