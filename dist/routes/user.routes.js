"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const user_controller_1 = require("../controllers/user.controller");
const error_middleware_1 = require("../middleware/error.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const user_validation_1 = require("../validations/user.validation");
const index_1 = require("../types/index");
const router = (0, express_1.Router)();
// Configure multer for avatar uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    },
});
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// ===========================================
// Current User Routes
// ===========================================
/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', (0, error_middleware_1.asyncHandler)(user_controller_1.userController.getProfile));
/**
 * @route   PATCH /api/v1/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.patch('/profile', (0, error_middleware_1.validate)({ body: user_validation_1.updateProfileSchema }), (0, error_middleware_1.asyncHandler)(user_controller_1.userController.updateProfile));
/**
 * @route   POST /api/v1/users/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post('/avatar', rateLimit_middleware_1.uploadRateLimiter, upload.single('avatar'), (0, error_middleware_1.asyncHandler)(user_controller_1.userController.uploadAvatar));
/**
 * @route   DELETE /api/v1/users/avatar
 * @desc    Remove user avatar
 * @access  Private
 */
router.delete('/avatar', (0, error_middleware_1.asyncHandler)(user_controller_1.userController.removeAvatar));
/**
 * @route   GET /api/v1/users/preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get('/preferences', (0, error_middleware_1.asyncHandler)(user_controller_1.userController.getPreferences));
/**
 * @route   PATCH /api/v1/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.patch('/preferences', (0, error_middleware_1.validate)({ body: user_validation_1.updatePreferencesSchema }), (0, error_middleware_1.asyncHandler)(user_controller_1.userController.updatePreferences));
/**
 * @route   GET /api/v1/users/activity
 * @desc    Get user activity history
 * @access  Private
 */
router.get('/activity', (0, error_middleware_1.asyncHandler)(user_controller_1.userController.getActivity));
/**
 * @route   DELETE /api/v1/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', (0, error_middleware_1.asyncHandler)(user_controller_1.userController.deleteAccount));
// ===========================================
// User Search & Lookup
// ===========================================
/**
 * @route   GET /api/v1/users/search
 * @desc    Search users (for mentions, assignments, etc.)
 * @access  Private
 */
router.get('/search', (0, error_middleware_1.validate)({ query: user_validation_1.searchUsersSchema }), (0, error_middleware_1.asyncHandler)(user_controller_1.userController.searchUsers));
/**
 * @route   GET /api/v1/users/:userId
 * @desc    Get user by ID (limited info)
 * @access  Private
 */
router.get('/:userId', (0, error_middleware_1.asyncHandler)(user_controller_1.userController.getUserById));
// ===========================================
// Admin Routes
// ===========================================
/**
 * @route   GET /api/v1/users
 * @desc    List all users (admin only)
 * @access  Private (Admin)
 */
router.get('/', (0, auth_middleware_1.requireRole)(index_1.UserRole.ADMIN), (0, error_middleware_1.asyncHandler)(user_controller_1.userController.listUsers));
/**
 * @route   PATCH /api/v1/users/:userId/role
 * @desc    Update user role (admin only)
 * @access  Private (Admin)
 */
router.patch('/:userId/role', (0, auth_middleware_1.requireRole)(index_1.UserRole.ADMIN), (0, error_middleware_1.asyncHandler)(user_controller_1.userController.updateUserRole));
/**
 * @route   POST /api/v1/users/:userId/suspend
 * @desc    Suspend user (admin only)
 * @access  Private (Admin)
 */
router.post('/:userId/suspend', (0, auth_middleware_1.requireRole)(index_1.UserRole.ADMIN), (0, error_middleware_1.asyncHandler)(user_controller_1.userController.suspendUser));
/**
 * @route   POST /api/v1/users/:userId/activate
 * @desc    Activate user (admin only)
 * @access  Private (Admin)
 */
router.post('/:userId/activate', (0, auth_middleware_1.requireRole)(index_1.UserRole.ADMIN), (0, error_middleware_1.asyncHandler)(user_controller_1.userController.activateUser));
exports.default = router;
//# sourceMappingURL=user.routes.js.map