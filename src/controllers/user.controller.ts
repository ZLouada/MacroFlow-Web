import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../utils/errors';

export const userController = {
  /**
   * Get current user profile
   * GET /api/v1/users/me
   */
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await userService.getUserById(req.user.id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update current user profile
   * PATCH /api/v1/users/me
   */
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await userService.updateUser(req.user.id, req.body);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user by ID
   * GET /api/v1/users/:id
   */
  async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await userService.getUserById(id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Search users (for mentions, assignments, etc.)
   * GET /api/v1/users/search
   */
  async searchUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { query, workspaceId, limit } = req.query;

      const users = await userService.searchUsers(
        query as string,
        workspaceId as string | undefined,
        limit ? parseInt(limit as string, 10) : undefined
      );

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update user preferences
   * PATCH /api/v1/users/me/preferences
   */
  async updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await userService.updatePreferences(req.user.id, req.body);

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Upload user avatar
   * POST /api/v1/users/me/avatar
   */
  async uploadAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      const user = await userService.updateAvatar(req.user.id, req.file);

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete user avatar
   * DELETE /api/v1/users/me/avatar
   */
  async deleteAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      await userService.deleteAvatar(req.user.id);

      res.json({
        success: true,
        message: 'Avatar deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove user avatar (alias for deleteAvatar)
   * DELETE /api/v1/users/avatar
   */
  async removeAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      await userService.deleteAvatar(req.user.id);

      res.json({
        success: true,
        message: 'Avatar removed successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user preferences
   * GET /api/v1/users/preferences
   */
  async getPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await userService.getUserById(req.user.id);

      res.json({
        success: true,
        data: user.preferences || {},
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user's workspaces
   * GET /api/v1/users/me/workspaces
   */
  async getMyWorkspaces(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const workspaces = await userService.getUserWorkspaces(req.user.id);

      res.json({
        success: true,
        data: workspaces,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user's assigned tasks
   * GET /api/v1/users/me/tasks
   */
  async getMyTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { status, priority, dueDate, cursor, limit } = req.query;

      const tasks = await userService.getUserTasks(req.user.id, {
        status: status as string | undefined,
        priority: priority as string | undefined,
        dueDate: dueDate as string | undefined,
        cursor: cursor as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.json({
        success: true,
        data: tasks.data,
        pagination: tasks.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user's notifications
   * GET /api/v1/users/me/notifications
   */
  async getMyNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { unreadOnly, cursor, limit } = req.query;

      const notifications = await userService.getUserNotifications(req.user.id, {
        unreadOnly: unreadOnly === 'true',
        cursor: cursor as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.json({
        success: true,
        data: notifications.data,
        pagination: notifications.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete user account (soft delete)
   * DELETE /api/v1/users/me
   */
  async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { password, confirmation } = req.body;

      if (confirmation !== 'DELETE') {
        throw new AppError('Please type DELETE to confirm account deletion', 400);
      }

      await userService.deleteUser(req.user.id, password);

      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user activity history
   * GET /api/v1/users/activity
   */
  async getActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { cursor, limit } = req.query;

      // Use activity service to get user's activity
      const result = await userService.getUserActivity(req.user.id, {
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

  // ===========================================
  // Admin Routes
  // ===========================================

  /**
   * List all users (admin only)
   * GET /api/v1/users
   */
  async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, role, sortBy, sortOrder } = req.query;

      const result = await userService.listUsers({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        search: search as string | undefined,
        role: role as string | undefined,
        sortBy: (sortBy as string) || 'createdAt',
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
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
   * Update user role (admin only)
   * PATCH /api/v1/users/:userId/role
   */
  async updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      const user = await userService.updateUserRole(userId, role);

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Suspend user (admin only)
   * POST /api/v1/users/:userId/suspend
   */
  async suspendUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;

      const user = await userService.suspendUser(userId, reason);

      res.json({
        success: true,
        message: 'User suspended successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Activate user (admin only)
   * POST /api/v1/users/:userId/activate
   */
  async activateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const user = await userService.activateUser(userId);

      res.json({
        success: true,
        message: 'User activated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
};
