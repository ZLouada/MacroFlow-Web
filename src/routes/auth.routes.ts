import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate, asyncHandler } from '../middleware/error.middleware.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
} from '../validations/auth.validation.js';

const router = Router();

// ===========================================
// Public Routes (with rate limiting)
// ===========================================

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  asyncHandler(authController.register)
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user and return tokens
 * @access  Public
 */
router.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  asyncHandler(authController.login)
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post(
  '/refresh',
  authRateLimiter,
  validate({ body: refreshTokenSchema }),
  asyncHandler(authController.refreshToken)
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post(
  '/forgot-password',
  authRateLimiter,
  validate({ body: forgotPasswordSchema }),
  asyncHandler(authController.forgotPassword)
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post(
  '/reset-password',
  authRateLimiter,
  validate({ body: resetPasswordSchema }),
  asyncHandler(authController.resetPassword)
);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post(
  '/verify-email',
  validate({ body: verifyEmailSchema }),
  asyncHandler(authController.verifyEmail)
);

// ===========================================
// Protected Routes
// ===========================================

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user and invalidate tokens
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(authController.logout)
);

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post(
  '/logout-all',
  authenticate,
  asyncHandler(authController.revokeAllSessions)
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password (requires current password)
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  asyncHandler(authController.changePassword)
);

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Resend email verification
 * @access  Private
 */
router.post(
  '/resend-verification',
  authenticate,
  authRateLimiter,
  asyncHandler(authController.resendVerification)
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(authController.me)
);

/**
 * @route   GET /api/v1/auth/sessions
 * @desc    Get all active sessions
 * @access  Private
 */
router.get(
  '/sessions',
  authenticate,
  asyncHandler(authController.getSessions)
);

/**
 * @route   DELETE /api/v1/auth/sessions/:sessionId
 * @desc    Revoke a specific session
 * @access  Private
 */
router.delete(
  '/sessions/:sessionId',
  authenticate,
  asyncHandler(authController.revokeSession)
);

export default router;
