"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = void 0;
const notification_service_1 = require("../services/notification.service");
const errors_1 = require("../utils/errors");
exports.notificationController = {
    /**
     * Get user's notifications
     * GET /api/v1/notifications
     */
    async getAll(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { cursor, limit, unreadOnly, type } = req.query;
            const result = await notification_service_1.notificationService.getUserNotifications(req.user.id, {
                cursor: cursor,
                limit: limit ? parseInt(limit, 10) : undefined,
                unreadOnly: unreadOnly === 'true',
                type: type,
            });
            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get notification by ID
     * GET /api/v1/notifications/:notificationId
     */
    async getById(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { notificationId } = req.params;
            const notification = await notification_service_1.notificationService.getNotificationById(notificationId, req.user.id);
            res.json({
                success: true,
                data: notification,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get unread notification count
     * GET /api/v1/notifications/unread-count
     */
    async getUnreadCount(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const count = await notification_service_1.notificationService.getUnreadCount(req.user.id);
            res.json({
                success: true,
                data: {
                    count,
                },
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Mark notification as read
     * POST /api/v1/notifications/:notificationId/read
     */
    async markAsRead(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { notificationId } = req.params;
            const notification = await notification_service_1.notificationService.markAsRead(notificationId, req.user.id);
            res.json({
                success: true,
                message: 'Notification marked as read',
                data: notification,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Mark all notifications as read
     * POST /api/v1/notifications/mark-all-read
     */
    async markAllAsRead(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const count = await notification_service_1.notificationService.markAllAsRead(req.user.id);
            res.json({
                success: true,
                message: `${count} notifications marked as read`,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Mark notification as unread
     * POST /api/v1/notifications/:notificationId/unread
     */
    async markAsUnread(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { notificationId } = req.params;
            const notification = await notification_service_1.notificationService.markAsUnread(notificationId, req.user.id);
            res.json({
                success: true,
                message: 'Notification marked as unread',
                data: notification,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Delete notification
     * DELETE /api/v1/notifications/:notificationId
     */
    async delete(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { notificationId } = req.params;
            await notification_service_1.notificationService.deleteNotification(notificationId, req.user.id);
            res.json({
                success: true,
                message: 'Notification deleted',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Delete all notifications
     * DELETE /api/v1/notifications
     */
    async deleteAll(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { readOnly } = req.query;
            const count = await notification_service_1.notificationService.deleteAllNotifications(req.user.id, readOnly === 'true');
            res.json({
                success: true,
                message: `${count} notifications deleted`,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get notification preferences
     * GET /api/v1/notifications/preferences
     */
    async getPreferences(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const preferences = await notification_service_1.notificationService.getNotificationPreferences(req.user.id);
            res.json({
                success: true,
                data: preferences,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Update notification preferences
     * PATCH /api/v1/notifications/preferences
     */
    async updatePreferences(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const preferences = await notification_service_1.notificationService.updateNotificationPreferences(req.user.id, req.body);
            res.json({
                success: true,
                message: 'Notification preferences updated',
                data: preferences,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Bulk mark notifications as read
     * POST /api/v1/notifications/bulk/read
     */
    async bulkMarkAsRead(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { notificationIds } = req.body;
            const count = await notification_service_1.notificationService.bulkMarkAsRead(req.user.id, notificationIds);
            res.json({
                success: true,
                message: `${count} notifications marked as read`,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Bulk delete notifications
     * DELETE /api/v1/notifications/bulk
     */
    async bulkDelete(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { notificationIds } = req.body;
            const count = await notification_service_1.notificationService.bulkDeleteNotifications(req.user.id, notificationIds);
            res.json({
                success: true,
                message: `${count} notifications deleted`,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Subscribe to push notifications
     * POST /api/v1/notifications/push/subscribe
     */
    async subscribeToPush(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { subscription } = req.body;
            await notification_service_1.notificationService.subscribeToPushNotifications(req.user.id, subscription);
            res.json({
                success: true,
                message: 'Subscribed to push notifications',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Unsubscribe from push notifications
     * DELETE /api/v1/notifications/push/subscribe
     */
    async unsubscribeFromPush(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { endpoint } = req.body;
            await notification_service_1.notificationService.unsubscribeFromPushNotifications(req.user.id, endpoint);
            res.json({
                success: true,
                message: 'Unsubscribed from push notifications',
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=notification.controller.js.map