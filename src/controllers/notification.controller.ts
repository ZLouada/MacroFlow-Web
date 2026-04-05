import { Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../utils/errors';

export const notificationController = {
  /**
   * Get user's notifications
   * GET /api/v1/notifications
   */
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { cursor, limit, unreadOnly, type } = req.query;

      const result = await notificationService.getUserNotifications(req.user.id, {
        cursor: cursor as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        unreadOnly: unreadOnly === 'true',
        type: type as string | undefined,
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
   * Get notification by ID
   * GET /api/v1/notifications/:notificationId
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { notificationId } = req.params;

      const notification = await notificationService.getNotificationById(
        notificationId,
        req.user.id
      );

      res.json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get unread notification count
   * GET /api/v1/notifications/unread-count
   */
  async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const count = await notificationService.getUnreadCount(req.user.id);

      res.json({
        success: true,
        data: {
          count,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark notification as read
   * POST /api/v1/notifications/:notificationId/read
   */
  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { notificationId } = req.params;

      const notification = await notificationService.markAsRead(notificationId, req.user.id);

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark all notifications as read
   * POST /api/v1/notifications/mark-all-read
   */
  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const count = await notificationService.markAllAsRead(req.user.id);

      res.json({
        success: true,
        message: `${count} notifications marked as read`,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark notification as unread
   * POST /api/v1/notifications/:notificationId/unread
   */
  async markAsUnread(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { notificationId } = req.params;

      const notification = await notificationService.markAsUnread(notificationId, req.user.id);

      res.json({
        success: true,
        message: 'Notification marked as unread',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete notification
   * DELETE /api/v1/notifications/:notificationId
   */
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { notificationId } = req.params;

      await notificationService.deleteNotification(notificationId, req.user.id);

      res.json({
        success: true,
        message: 'Notification deleted',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete all notifications
   * DELETE /api/v1/notifications
   */
  async deleteAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { readOnly } = req.query;

      const count = await notificationService.deleteAllNotifications(
        req.user.id,
        readOnly === 'true'
      );

      res.json({
        success: true,
        message: `${count} notifications deleted`,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get notification preferences
   * GET /api/v1/notifications/preferences
   */
  async getPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const preferences = await notificationService.getNotificationPreferences(req.user.id);

      res.json({
        success: true,
        data: preferences,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update notification preferences
   * PATCH /api/v1/notifications/preferences
   */
  async updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const preferences = await notificationService.updateNotificationPreferences(
        req.user.id,
        req.body
      );

      res.json({
        success: true,
        message: 'Notification preferences updated',
        data: preferences,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Bulk mark notifications as read
   * POST /api/v1/notifications/bulk/read
   */
  async bulkMarkAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { notificationIds } = req.body;

      const count = await notificationService.bulkMarkAsRead(req.user.id, notificationIds);

      res.json({
        success: true,
        message: `${count} notifications marked as read`,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Bulk delete notifications
   * DELETE /api/v1/notifications/bulk
   */
  async bulkDelete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { notificationIds } = req.body;

      const count = await notificationService.bulkDeleteNotifications(req.user.id, notificationIds);

      res.json({
        success: true,
        message: `${count} notifications deleted`,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Subscribe to push notifications
   * POST /api/v1/notifications/push/subscribe
   */
  async subscribeToPush(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { subscription } = req.body;

      await notificationService.subscribeToPushNotifications(req.user.id, subscription);

      res.json({
        success: true,
        message: 'Subscribed to push notifications',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Unsubscribe from push notifications
   * DELETE /api/v1/notifications/push/subscribe
   */
  async unsubscribeFromPush(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { endpoint } = req.body;

      await notificationService.unsubscribeFromPushNotifications(req.user.id, endpoint);

      res.json({
        success: true,
        message: 'Unsubscribed from push notifications',
      });
    } catch (error) {
      next(error);
    }
  },
};
