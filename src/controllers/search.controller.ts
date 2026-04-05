import { Response, NextFunction } from 'express';
import { searchService } from '../services/search.service';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../utils/errors';

export const searchController = {
  /**
   * Global search across all resources
   * GET /api/v1/search
   */
  async globalSearch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { query, types, workspaceId, limit } = req.query;

      if (!query || (query as string).trim().length < 2) {
        throw new AppError('Search query must be at least 2 characters', 400);
      }

      const results = await searchService.globalSearch(req.user.id, {
        query: query as string,
        types: types ? (types as string).split(',') : undefined,
        workspaceId: workspaceId as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Search within a workspace
   * GET /api/v1/workspaces/:workspaceId/search
   */
  async workspaceSearch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { workspaceId } = req.params;
      const { query, types, limit } = req.query;

      if (!query || (query as string).trim().length < 2) {
        throw new AppError('Search query must be at least 2 characters', 400);
      }

      const results = await searchService.globalSearch(req.user.id, {
        query: query as string,
        types: types ? (types as string).split(',') : undefined,
        workspaceId,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Search tasks
   * GET /api/v1/search/tasks
   */
  async searchTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const {
        query,
        workspaceId,
        projectId,
        status,
        priority,
        assigneeId,
        labels,
        dueBefore,
        dueAfter,
        cursor,
        limit,
      } = req.query;

      const results = await searchService.searchTasks(req.user.id, {
        query: query as string | undefined,
        workspaceId: workspaceId as string | undefined,
        projectId: projectId as string | undefined,
        status: status as string | undefined,
        priority: priority as string | undefined,
        assigneeId: assigneeId as string | undefined,
        labels: labels ? (labels as string).split(',') : undefined,
        dueBefore: dueBefore as string | undefined,
        dueAfter: dueAfter as string | undefined,
        cursor: cursor as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.json({
        success: true,
        data: results.data,
        pagination: results.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Search projects
   * GET /api/v1/search/projects
   */
  async searchProjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { query, workspaceId, status, cursor, limit } = req.query;

      const results = await searchService.searchProjects(req.user.id, {
        query: query as string | undefined,
        workspaceId: workspaceId as string | undefined,
        status: status as string | undefined,
        cursor: cursor as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.json({
        success: true,
        data: results.data,
        pagination: results.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Search users
   * GET /api/v1/search/users
   */
  async searchUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { query, workspaceId, limit } = req.query;

      if (!query || (query as string).trim().length < 2) {
        throw new AppError('Search query must be at least 2 characters', 400);
      }

      const results = await searchService.searchUsers(req.user.id, {
        query: query as string,
        workspaceId: workspaceId as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Search comments
   * GET /api/v1/search/comments
   */
  async searchComments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { query, workspaceId, projectId, taskId, cursor, limit } = req.query;

      if (!query || (query as string).trim().length < 2) {
        throw new AppError('Search query must be at least 2 characters', 400);
      }

      const results = await searchService.searchComments(req.user.id, {
        query: query as string,
        workspaceId: workspaceId as string | undefined,
        projectId: projectId as string | undefined,
        taskId: taskId as string | undefined,
        cursor: cursor as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.json({
        success: true,
        data: results.data,
        pagination: results.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get search suggestions (autocomplete)
   * GET /api/v1/search/suggestions
   */
  async getSuggestions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { query, types, workspaceId, limit } = req.query;

      if (!query || (query as string).trim().length < 1) {
        throw new AppError('Search query is required', 400);
      }

      const suggestions = await searchService.getSuggestions(req.user.id, {
        query: query as string,
        types: types ? (types as string).split(',') : undefined,
        workspaceId: workspaceId as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : 10,
      });

      res.json({
        success: true,
        data: suggestions,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get recent searches
   * GET /api/v1/search/recent
   */
  async getRecentSearches(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { limit } = req.query;

      const recent = await searchService.getRecentSearches(req.user.id, {
        limit: limit ? parseInt(limit as string, 10) : 10,
      });

      res.json({
        success: true,
        data: recent,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Clear recent searches
   * DELETE /api/v1/search/recent
   */
  async clearRecentSearches(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      await searchService.clearRecentSearches(req.user.id);

      res.json({
        success: true,
        message: 'Recent searches cleared',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Save search query
   * POST /api/v1/search/saved
   */
  async saveSearch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { name, query, filters } = req.body;

      const savedSearch = await searchService.saveSearch(req.user.id, {
        name,
        query,
        filters,
      });

      res.status(201).json({
        success: true,
        message: 'Search saved',
        data: savedSearch,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get saved searches
   * GET /api/v1/search/saved
   */
  async getSavedSearches(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const savedSearches = await searchService.getSavedSearches(req.user.id);

      res.json({
        success: true,
        data: savedSearches,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete saved search
   * DELETE /api/v1/search/saved/:searchId
   */
  async deleteSavedSearch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { searchId } = req.params;

      await searchService.deleteSavedSearch(req.user.id, searchId);

      res.json({
        success: true,
        message: 'Saved search deleted',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Advanced search with filters
   * POST /api/v1/search/advanced
   */
  async advancedSearch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const results = await searchService.advancedSearch(req.user.id, req.body);

      res.json({
        success: true,
        data: results.data,
        pagination: results.pagination,
        facets: results.facets,
      });
    } catch (error) {
      next(error);
    }
  },
};
