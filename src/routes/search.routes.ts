import { Router } from 'express';
import { searchController } from '../controllers/search.controller.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { authenticate, requireWorkspaceAccess } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ===========================================
// Global Search
// ===========================================

/**
 * @route   GET /api/v1/search
 * @desc    Global search across all user's workspaces
 * @access  Private
 */
router.get(
  '/',
  asyncHandler(searchController.globalSearch)
);

// ===========================================
// Workspace Search
// ===========================================

/**
 * @route   GET /api/v1/workspaces/:workspaceId/search
 * @desc    Search within a workspace
 * @access  Private (Workspace Member)
 */
router.get(
  '/workspaces/:workspaceId/search',
  requireWorkspaceAccess(),
  asyncHandler(searchController.workspaceSearch)
);

// ===========================================
// Entity-Specific Search
// ===========================================

/**
 * @route   GET /api/v1/search/tasks
 * @desc    Search tasks
 * @access  Private
 */
router.get(
  '/tasks',
  asyncHandler(searchController.searchTasks)
);

/**
 * @route   GET /api/v1/search/projects
 * @desc    Search projects
 * @access  Private
 */
router.get(
  '/projects',
  asyncHandler(searchController.searchProjects)
);

/**
 * @route   GET /api/v1/search/users
 * @desc    Search users
 * @access  Private
 */
router.get(
  '/users',
  asyncHandler(searchController.searchUsers)
);

// ===========================================
// Recent & Suggestions
// ===========================================

/**
 * @route   GET /api/v1/search/recent
 * @desc    Get recent searches
 * @access  Private
 */
router.get(
  '/recent',
  asyncHandler(searchController.getRecentSearches)
);

/**
 * @route   GET /api/v1/search/suggestions
 * @desc    Get search suggestions
 * @access  Private
 */
router.get(
  '/suggestions',
  asyncHandler(searchController.getSuggestions)
);

/**
 * @route   DELETE /api/v1/search/recent
 * @desc    Clear recent searches
 * @access  Private
 */
router.delete(
  '/recent',
  asyncHandler(searchController.clearRecentSearches)
);

export default router;
