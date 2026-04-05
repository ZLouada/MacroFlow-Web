"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_js_1 = require("../controllers/notification.controller.js");
const error_middleware_js_1 = require("../middleware/error.middleware.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authenticate);
// ===========================================
// Notification Routes
// ===========================================
/**
 * @route   GET /api/v1/notifications
 * @desc    List user notifications
 * @access  Private
 */
router.get('/', (0, error_middleware_js_1.asyncHandler)(notification_controller_js_1.notificationController.getAll));
/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', (0, error_middleware_js_1.asyncHandler)(notification_controller_js_1.notificationController.getUnreadCount));
/**
 * @route   PATCH /api/v1/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch('/:notificationId/read', (0, error_middleware_js_1.asyncHandler)(notification_controller_js_1.notificationController.markAsRead));
/**
 * @route   PATCH /api/v1/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/read-all', (0, error_middleware_js_1.asyncHandler)(notification_controller_js_1.notificationController.markAllAsRead));
/**
 * @route   DELETE /api/v1/notifications/:notificationId
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:notificationId', (0, error_middleware_js_1.asyncHandler)(notification_controller_js_1.notificationController.delete));
/**
 * @route   DELETE /api/v1/notifications
 * @desc    Clear all notifications
 * @access  Private
 */
router.delete('/', (0, error_middleware_js_1.asyncHandler)(notification_controller_js_1.notificationController.deleteAll));
// ===========================================
// Notification Preferences
// ===========================================
/**
 * @route   GET /api/v1/notifications/preferences
 * @desc    Get notification preferences
 * @access  Private
 */
router.get('/preferences', (0, error_middleware_js_1.asyncHandler)(notification_controller_js_1.notificationController.getPreferences));
/**
 * @route   PATCH /api/v1/notifications/preferences
 * @desc    Update notification preferences
 * @access  Private
 */
router.patch('/preferences', (0, error_middleware_js_1.asyncHandler)(notification_controller_js_1.notificationController.updatePreferences));
exports.default = router;
//# sourceMappingURL=notification.routes.js.map