import { Router } from 'express';
import multer from 'multer';
import { userController } from '../controllers/user.controller';
import { validate, asyncHandler } from '../middleware/error.middleware';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { uploadRateLimiter } from '../middleware/rateLimit.middleware';
import {
  updateProfileSchema,
  updatePreferencesSchema,
  searchUsersSchema,
} from '../validations/user.validation';
import { UserRole } from '../types/index';

const router = Router();

// Configure multer for avatar uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// All routes require authentication
router.use(authenticate);

// ===========================================
// Current User Routes
// ===========================================

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/profile',
  asyncHandler(userController.getProfile)
);

/**
 * @route   PATCH /api/v1/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.patch(
  '/profile',
  validate({ body: updateProfileSchema }),
  asyncHandler(userController.updateProfile)
);

/**
 * @route   POST /api/v1/users/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post(
  '/avatar',
  uploadRateLimiter,
  upload.single('avatar'),
  asyncHandler(userController.uploadAvatar)
);

/**
 * @route   DELETE /api/v1/users/avatar
 * @desc    Remove user avatar
 * @access  Private
 */
router.delete(
  '/avatar',
  asyncHandler(userController.removeAvatar)
);

/**
 * @route   GET /api/v1/users/preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get(
  '/preferences',
  asyncHandler(userController.getPreferences)
);

/**
 * @route   PATCH /api/v1/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.patch(
  '/preferences',
  validate({ body: updatePreferencesSchema }),
  asyncHandler(userController.updatePreferences)
);

/**
 * @route   GET /api/v1/users/activity
 * @desc    Get user activity history
 * @access  Private
 */
router.get(
  '/activity',
  asyncHandler(userController.getActivity)
);

/**
 * @route   DELETE /api/v1/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete(
  '/account',
  asyncHandler(userController.deleteAccount)
);

// ===========================================
// User Search & Lookup
// ===========================================

/**
 * @route   GET /api/v1/users/search
 * @desc    Search users (for mentions, assignments, etc.)
 * @access  Private
 */
router.get(
  '/search',
  validate({ query: searchUsersSchema }),
  asyncHandler(userController.searchUsers)
);

/**
 * @route   GET /api/v1/users/:userId
 * @desc    Get user by ID (limited info)
 * @access  Private
 */
router.get(
  '/:userId',
  asyncHandler(userController.getUserById)
);

// ===========================================
// Admin Routes
// ===========================================

/**
 * @route   GET /api/v1/users
 * @desc    List all users (admin only)
 * @access  Private (Admin)
 */
router.get(
  '/',
  requireRole(UserRole.ADMIN),
  asyncHandler(userController.listUsers)
);

/**
 * @route   PATCH /api/v1/users/:userId/role
 * @desc    Update user role (admin only)
 * @access  Private (Admin)
 */
router.patch(
  '/:userId/role',
  requireRole(UserRole.ADMIN),
  asyncHandler(userController.updateUserRole)
);

/**
 * @route   POST /api/v1/users/:userId/suspend
 * @desc    Suspend user (admin only)
 * @access  Private (Admin)
 */
router.post(
  '/:userId/suspend',
  requireRole(UserRole.ADMIN),
  asyncHandler(userController.suspendUser)
);

/**
 * @route   POST /api/v1/users/:userId/activate
 * @desc    Activate user (admin only)
 * @access  Private (Admin)
 */
router.post(
  '/:userId/activate',
  requireRole(UserRole.ADMIN),
  asyncHandler(userController.activateUser)
);

export default router;
