"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const error_middleware_1 = require("../middleware/error.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// ===========================================
// User Dashboard
// ===========================================
/**
 * @route   GET /api/v1/dashboard
 * @desc    Get user dashboard overview
 * @access  Private
 */
router.get('/', (0, error_middleware_1.asyncHandler)(dashboard_controller_1.dashboardController.getPersonalDashboard));
/**
 * @route   GET /api/v1/dashboard/tasks
 * @desc    Get user's tasks across all projects
 * @access  Private
 */
router.get('/tasks', (0, error_middleware_1.asyncHandler)(dashboard_controller_1.dashboardController.getMyTasks));
/**
 * @route   GET /api/v1/dashboard/recent
 * @desc    Get recent activity
 * @access  Private
 */
router.get('/recent', (0, error_middleware_1.asyncHandler)(dashboard_controller_1.dashboardController.getActivityTimeline));
/**
 * @route   GET /api/v1/dashboard/upcoming
 * @desc    Get upcoming deadlines
 * @access  Private
 */
router.get('/upcoming', (0, error_middleware_1.asyncHandler)(dashboard_controller_1.dashboardController.getUpcomingDeadlines));
/**
 * @route   GET /api/v1/dashboard/overdue
 * @desc    Get overdue tasks
 * @access  Private
 */
router.get('/overdue', (0, error_middleware_1.asyncHandler)(dashboard_controller_1.dashboardController.getOverdueTasks));
// ===========================================
// Workspace Analytics
// ===========================================
/**
 * @route   GET /api/v1/workspaces/:workspaceId/analytics
 * @desc    Get workspace analytics
 * @access  Private (Workspace Member)
 */
router.get('/workspaces/:workspaceId/analytics', (0, auth_middleware_1.requireWorkspaceAccess)(), (0, error_middleware_1.asyncHandler)(dashboard_controller_1.dashboardController.getWorkspaceDashboard));
/**
 * @route   GET /api/v1/workspaces/:workspaceId/analytics/productivity
 * @desc    Get productivity metrics
 * @access  Private (Workspace Member)
 */
router.get('/workspaces/:workspaceId/analytics/productivity', (0, auth_middleware_1.requireWorkspaceAccess)(), (0, error_middleware_1.asyncHandler)(dashboard_controller_1.dashboardController.getVelocity));
/**
 * @route   GET /api/v1/workspaces/:workspaceId/analytics/team
 * @desc    Get team performance metrics
 * @access  Private (Workspace Member)
 */
router.get('/workspaces/:workspaceId/analytics/team', (0, auth_middleware_1.requireWorkspaceAccess)(), (0, error_middleware_1.asyncHandler)(dashboard_controller_1.dashboardController.getWorkload));
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map