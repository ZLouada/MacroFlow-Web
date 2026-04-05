import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const notificationController: {
    /**
     * Get user's notifications
     * GET /api/v1/notifications
     */
    getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get notification by ID
     * GET /api/v1/notifications/:notificationId
     */
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get unread notification count
     * GET /api/v1/notifications/unread-count
     */
    getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Mark notification as read
     * POST /api/v1/notifications/:notificationId/read
     */
    markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Mark all notifications as read
     * POST /api/v1/notifications/mark-all-read
     */
    markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Mark notification as unread
     * POST /api/v1/notifications/:notificationId/unread
     */
    markAsUnread(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete notification
     * DELETE /api/v1/notifications/:notificationId
     */
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete all notifications
     * DELETE /api/v1/notifications
     */
    deleteAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get notification preferences
     * GET /api/v1/notifications/preferences
     */
    getPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update notification preferences
     * PATCH /api/v1/notifications/preferences
     */
    updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Bulk mark notifications as read
     * POST /api/v1/notifications/bulk/read
     */
    bulkMarkAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Bulk delete notifications
     * DELETE /api/v1/notifications/bulk
     */
    bulkDelete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Subscribe to push notifications
     * POST /api/v1/notifications/push/subscribe
     */
    subscribeToPush(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Unsubscribe from push notifications
     * DELETE /api/v1/notifications/push/subscribe
     */
    unsubscribeFromPush(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=notification.controller.d.ts.map