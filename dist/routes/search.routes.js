"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_controller_js_1 = require("../controllers/search.controller.js");
const error_middleware_js_1 = require("../middleware/error.middleware.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authenticate);
// ===========================================
// Global Search
// ===========================================
/**
 * @route   GET /api/v1/search
 * @desc    Global search across all user's workspaces
 * @access  Private
 */
router.get('/', (0, error_middleware_js_1.asyncHandler)(search_controller_js_1.searchController.globalSearch));
// ===========================================
// Workspace Search
// ===========================================
/**
 * @route   GET /api/v1/workspaces/:workspaceId/search
 * @desc    Search within a workspace
 * @access  Private (Workspace Member)
 */
router.get('/workspaces/:workspaceId/search', (0, auth_middleware_js_1.requireWorkspaceAccess)(), (0, error_middleware_js_1.asyncHandler)(search_controller_js_1.searchController.workspaceSearch));
// ===========================================
// Entity-Specific Search
// ===========================================
/**
 * @route   GET /api/v1/search/tasks
 * @desc    Search tasks
 * @access  Private
 */
router.get('/tasks', (0, error_middleware_js_1.asyncHandler)(search_controller_js_1.searchController.searchTasks));
/**
 * @route   GET /api/v1/search/projects
 * @desc    Search projects
 * @access  Private
 */
router.get('/projects', (0, error_middleware_js_1.asyncHandler)(search_controller_js_1.searchController.searchProjects));
/**
 * @route   GET /api/v1/search/users
 * @desc    Search users
 * @access  Private
 */
router.get('/users', (0, error_middleware_js_1.asyncHandler)(search_controller_js_1.searchController.searchUsers));
// ===========================================
// Recent & Suggestions
// ===========================================
/**
 * @route   GET /api/v1/search/recent
 * @desc    Get recent searches
 * @access  Private
 */
router.get('/recent', (0, error_middleware_js_1.asyncHandler)(search_controller_js_1.searchController.getRecentSearches));
/**
 * @route   GET /api/v1/search/suggestions
 * @desc    Get search suggestions
 * @access  Private
 */
router.get('/suggestions', (0, error_middleware_js_1.asyncHandler)(search_controller_js_1.searchController.getSuggestions));
/**
 * @route   DELETE /api/v1/search/recent
 * @desc    Clear recent searches
 * @access  Private
 */
router.delete('/recent', (0, error_middleware_js_1.asyncHandler)(search_controller_js_1.searchController.clearRecentSearches));
exports.default = router;
//# sourceMappingURL=search.routes.js.map