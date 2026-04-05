import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { asyncHandler } from '../middleware/error.middleware';
import { authenticate, requireWorkspaceAccess } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ===========================================
// User Dashboard
// ===========================================

/**
 * @route   GET /api/v1/dashboard
 * @desc    Get user dashboard overview
 * @access  Private
 */
router.get(
  '/',
  asyncHandler(dashboardController.getPersonalDashboard)
);

/**
 * @route   GET /api/v1/dashboard/tasks
 * @desc    Get user's tasks across all projects
 * @access  Private
 */
router.get(
  '/tasks',
  asyncHandler(dashboardController.getMyTasks)
);

/**
 * @route   GET /api/v1/dashboard/recent
 * @desc    Get recent activity
 * @access  Private
 */
router.get(
  '/recent',
  asyncHandler(dashboardController.getActivityTimeline)
);

/**
 * @route   GET /api/v1/dashboard/upcoming
 * @desc    Get upcoming deadlines
 * @access  Private
 */
router.get(
  '/upcoming',
  asyncHandler(dashboardController.getUpcomingDeadlines)
);

/**
 * @route   GET /api/v1/dashboard/overdue
 * @desc    Get overdue tasks
 * @access  Private
 */
router.get(
  '/overdue',
  asyncHandler(dashboardController.getOverdueTasks)
);

// ===========================================
// Workspace Analytics
// ===========================================

/**
 * @route   GET /api/v1/workspaces/:workspaceId/analytics
 * @desc    Get workspace analytics
 * @access  Private (Workspace Member)
 */
router.get(
  '/workspaces/:workspaceId/analytics',
  requireWorkspaceAccess(),
  asyncHandler(dashboardController.getWorkspaceDashboard)
);

/**
 * @route   GET /api/v1/workspaces/:workspaceId/analytics/productivity
 * @desc    Get productivity metrics
 * @access  Private (Workspace Member)
 */
router.get(
  '/workspaces/:workspaceId/analytics/productivity',
  requireWorkspaceAccess(),
  asyncHandler(dashboardController.getVelocity)
);

/**
 * @route   GET /api/v1/workspaces/:workspaceId/analytics/team
 * @desc    Get team performance metrics
 * @access  Private (Workspace Member)
 */
router.get(
  '/workspaces/:workspaceId/analytics/team',
  requireWorkspaceAccess(),
  asyncHandler(dashboardController.getWorkload)
);

export default router;
