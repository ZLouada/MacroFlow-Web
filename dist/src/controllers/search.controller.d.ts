import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const searchController: {
    /**
     * Global search across all resources
     * GET /api/v1/search
     */
    globalSearch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Search within a workspace
     * GET /api/v1/workspaces/:workspaceId/search
     */
    workspaceSearch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Search tasks
     * GET /api/v1/search/tasks
     */
    searchTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Search projects
     * GET /api/v1/search/projects
     */
    searchProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Search users
     * GET /api/v1/search/users
     */
    searchUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Search comments
     * GET /api/v1/search/comments
     */
    searchComments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get search suggestions (autocomplete)
     * GET /api/v1/search/suggestions
     */
    getSuggestions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get recent searches
     * GET /api/v1/search/recent
     */
    getRecentSearches(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Clear recent searches
     * DELETE /api/v1/search/recent
     */
    clearRecentSearches(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Save search query
     * POST /api/v1/search/saved
     */
    saveSearch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get saved searches
     * GET /api/v1/search/saved
     */
    getSavedSearches(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete saved search
     * DELETE /api/v1/search/saved/:searchId
     */
    deleteSavedSearch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Advanced search with filters
     * POST /api/v1/search/advanced
     */
    advancedSearch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=search.controller.d.ts.map