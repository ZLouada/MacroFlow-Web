"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchController = void 0;
const search_service_1 = require("../services/search.service");
const errors_1 = require("../utils/errors");
exports.searchController = {
    /**
     * Global search across all resources
     * GET /api/v1/search
     */
    async globalSearch(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { query, types, workspaceId, limit } = req.query;
            if (!query || query.trim().length < 2) {
                throw new errors_1.AppError('Search query must be at least 2 characters', 400);
            }
            const results = await search_service_1.searchService.globalSearch(req.user.id, {
                query: query,
                types: types ? types.split(',') : undefined,
                workspaceId: workspaceId,
                limit: limit ? parseInt(limit, 10) : undefined,
            });
            res.json({
                success: true,
                data: results,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Search within a workspace
     * GET /api/v1/workspaces/:workspaceId/search
     */
    async workspaceSearch(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { workspaceId } = req.params;
            const { query, types, limit } = req.query;
            if (!query || query.trim().length < 2) {
                throw new errors_1.AppError('Search query must be at least 2 characters', 400);
            }
            const results = await search_service_1.searchService.globalSearch(req.user.id, {
                query: query,
                types: types ? types.split(',') : undefined,
                workspaceId,
                limit: limit ? parseInt(limit, 10) : undefined,
            });
            res.json({
                success: true,
                data: results,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Search tasks
     * GET /api/v1/search/tasks
     */
    async searchTasks(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { query, workspaceId, projectId, status, priority, assigneeId, labels, dueBefore, dueAfter, cursor, limit, } = req.query;
            const results = await search_service_1.searchService.searchTasks(req.user.id, {
                query: query,
                workspaceId: workspaceId,
                projectId: projectId,
                status: status,
                priority: priority,
                assigneeId: assigneeId,
                labels: labels ? labels.split(',') : undefined,
                dueBefore: dueBefore,
                dueAfter: dueAfter,
                cursor: cursor,
                limit: limit ? parseInt(limit, 10) : undefined,
            });
            res.json({
                success: true,
                data: results.data,
                pagination: results.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Search projects
     * GET /api/v1/search/projects
     */
    async searchProjects(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { query, workspaceId, status, cursor, limit } = req.query;
            const results = await search_service_1.searchService.searchProjects(req.user.id, {
                query: query,
                workspaceId: workspaceId,
                status: status,
                cursor: cursor,
                limit: limit ? parseInt(limit, 10) : undefined,
            });
            res.json({
                success: true,
                data: results.data,
                pagination: results.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Search users
     * GET /api/v1/search/users
     */
    async searchUsers(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { query, workspaceId, limit } = req.query;
            if (!query || query.trim().length < 2) {
                throw new errors_1.AppError('Search query must be at least 2 characters', 400);
            }
            const results = await search_service_1.searchService.searchUsers(req.user.id, {
                query: query,
                workspaceId: workspaceId,
                limit: limit ? parseInt(limit, 10) : undefined,
            });
            res.json({
                success: true,
                data: results,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Search comments
     * GET /api/v1/search/comments
     */
    async searchComments(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { query, workspaceId, projectId, taskId, cursor, limit } = req.query;
            if (!query || query.trim().length < 2) {
                throw new errors_1.AppError('Search query must be at least 2 characters', 400);
            }
            const results = await search_service_1.searchService.searchComments(req.user.id, {
                query: query,
                workspaceId: workspaceId,
                projectId: projectId,
                taskId: taskId,
                cursor: cursor,
                limit: limit ? parseInt(limit, 10) : undefined,
            });
            res.json({
                success: true,
                data: results.data,
                pagination: results.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get search suggestions (autocomplete)
     * GET /api/v1/search/suggestions
     */
    async getSuggestions(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { query, types, workspaceId, limit } = req.query;
            if (!query || query.trim().length < 1) {
                throw new errors_1.AppError('Search query is required', 400);
            }
            const suggestions = await search_service_1.searchService.getSuggestions(req.user.id, {
                query: query,
                types: types ? types.split(',') : undefined,
                workspaceId: workspaceId,
                limit: limit ? parseInt(limit, 10) : 10,
            });
            res.json({
                success: true,
                data: suggestions,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get recent searches
     * GET /api/v1/search/recent
     */
    async getRecentSearches(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { limit } = req.query;
            const recent = await search_service_1.searchService.getRecentSearches(req.user.id, {
                limit: limit ? parseInt(limit, 10) : 10,
            });
            res.json({
                success: true,
                data: recent,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Clear recent searches
     * DELETE /api/v1/search/recent
     */
    async clearRecentSearches(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            await search_service_1.searchService.clearRecentSearches(req.user.id);
            res.json({
                success: true,
                message: 'Recent searches cleared',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Save search query
     * POST /api/v1/search/saved
     */
    async saveSearch(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { name, query, filters } = req.body;
            const savedSearch = await search_service_1.searchService.saveSearch(req.user.id, {
                name,
                query,
                filters,
            });
            res.status(201).json({
                success: true,
                message: 'Search saved',
                data: savedSearch,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get saved searches
     * GET /api/v1/search/saved
     */
    async getSavedSearches(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const savedSearches = await search_service_1.searchService.getSavedSearches(req.user.id);
            res.json({
                success: true,
                data: savedSearches,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Delete saved search
     * DELETE /api/v1/search/saved/:searchId
     */
    async deleteSavedSearch(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { searchId } = req.params;
            await search_service_1.searchService.deleteSavedSearch(req.user.id, searchId);
            res.json({
                success: true,
                message: 'Saved search deleted',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Advanced search with filters
     * POST /api/v1/search/advanced
     */
    async advancedSearch(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const results = await search_service_1.searchService.advancedSearch(req.user.id, req.body);
            res.json({
                success: true,
                data: results.data,
                pagination: results.pagination,
                facets: results.facets,
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=search.controller.js.map