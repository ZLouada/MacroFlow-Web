import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { asyncHandler } from '../middleware/error.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ===========================================
// Notification Routes
// ===========================================

/**
 * @route   GET /api/v1/notifications
 * @desc    List user notifications
 * @access  Private
 */
router.get(
  '/',
  asyncHandler(notificationController.getAll)
);

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get(
  '/unread-count',
  asyncHandler(notificationController.getUnreadCount)
);

/**
 * @route   PATCH /api/v1/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch(
  '/:notificationId/read',
  asyncHandler(notificationController.markAsRead)
);

/**
 * @route   PATCH /api/v1/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch(
  '/read-all',
  asyncHandler(notificationController.markAllAsRead)
);

/**
 * @route   DELETE /api/v1/notifications/:notificationId
 * @desc    Delete notification
 * @access  Private
 */
router.delete(
  '/:notificationId',
  asyncHandler(notificationController.delete)
);

/**
 * @route   DELETE /api/v1/notifications
 * @desc    Clear all notifications
 * @access  Private
 */
router.delete(
  '/',
  asyncHandler(notificationController.deleteAll)
);

// ===========================================
// Notification Preferences
// ===========================================

/**
 * @route   GET /api/v1/notifications/preferences
 * @desc    Get notification preferences
 * @access  Private
 */
router.get(
  '/preferences',
  asyncHandler(notificationController.getPreferences)
);

/**
 * @route   PATCH /api/v1/notifications/preferences
 * @desc    Update notification preferences
 * @access  Private
 */
router.patch(
  '/preferences',
  asyncHandler(notificationController.updatePreferences)
);

export default router;
