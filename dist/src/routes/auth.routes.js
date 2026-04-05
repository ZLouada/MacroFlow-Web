"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_js_1 = require("../controllers/auth.controller.js");
const error_middleware_js_1 = require("../middleware/error.middleware.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const rateLimit_middleware_js_1 = require("../middleware/rateLimit.middleware.js");
const auth_validation_js_1 = require("../validations/auth.validation.js");
const router = (0, express_1.Router)();
// ===========================================
// Public Routes (with rate limiting)
// ===========================================
/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', rateLimit_middleware_js_1.authRateLimiter, (0, error_middleware_js_1.validate)({ body: auth_validation_js_1.registerSchema }), (0, error_middleware_js_1.asyncHandler)(auth_controller_js_1.authController.register));
/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user and return tokens
 * @access  Public
 */
router.post('/login', rateLimit_middleware_js_1.authRateLimiter, (0, error_middleware_js_1.validate)({ body: auth_validation_js_1.loginSchema }), (0, error_middleware_js_1.asyncHandler)(auth_controller_js_1.authController.login));
/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', rateLimit_middleware_js_1.authRateLimiter, (0, error_middleware_js_1.validate)({ body: auth_validation_js_1.refreshTokenSchema }), (0, error_middleware_js_1.asyncHandler)(auth_controller_js_1.authController.refreshToken));
/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post('/forgot-password', rateLimit_middleware_js_1.authRateLimiter, (0, error_middleware_js_1.validate)({ body: auth_validation_js_1.forgotPasswordSchema }), (0, error_middleware_js_1.asyncHandler)(auth_controller_js_1.authController.forgotPassword));
/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password', rateLimit_middleware_js_1.authRateLimiter, (0, error_middleware_js_1.validate)({ body: auth_validation_js_1.resetPasswordSchema }), (0, error_middleware_js_1.asyncHandler)(auth_controller_js_1.authController.resetPassword));
/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post('/verify-email', (0, error_middleware_js_1.validate)({ body: auth_validation_js_1.verifyEmailSchema }), (0, error_middleware_js_1.asyncHandler)(auth_controller_js_1.authController.verifyEmail));
// ===========================================
// Google OAuth Routes
// ===========================================
/**
 * @route   GET /api/v1/auth/google
 * @desc    Redirect to Google OAuth
 * @access  Public
 */
router.get('/google', (0, error_middleware_js_1.asyncHandler)(auth_controller_js_1.authController.googleAuth));
/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Handle Google OAuth callback
 * @access  Public
 */
router.get('/google/callback', (0, error_middleware_js_1.asyncHandler)(auth_controller_js_1.authController.googleCallback));
// ===========================================
// Protected Routes
// ===========================================
/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user and invalidate tokens
 * @access  Private
 */
router.post('/logout', auth_middleware_js_1.authenticate, (0, error_middleware_js_1.asyncHandler)(auth_controller_js_1.authController.logout));
/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post('/logout-all', auth_middleware_js_1.authenticate, (0, error_middleware_js_1.asyncHandler)(auth_controller_js_1.authController.revokeAllSessions));
/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password (requires current password)
 * @access  Private
 */
router.post('/change-password', auth_middleware_js_1.authenticate, (0, error_middleware_js_1.validate)({ body: auth_validation_js_1.changePasswordSchema }), (0, error_middleware_js_1.asyncHandler)(auth_controller_js_1.authController.changePassword));
/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Resend email verification
 * @access  Private
 */
router.post('/resend-verification', auth_middleware_js_1.authenticate, rateLimit_middleware_js_1.authRateLimiter, (0, error_middleware_js_1.asyncHandler)(auth_controller_js_1.authController.resendVerification));
/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', auth_middleware_js_1.authenticate, (0, error_middleware_js_1.asyncHandler)(auth_controller_js_1.authController.me));
/**
 * @route   GET /api/v1/auth/sessions
 * @desc    Get all active sessions
 * @access  Private
 */
router.get('/sessions', auth_middleware_js_1.authenticate, (0, error_middleware_js_1.asyncHandler)(auth_controller_js_1.authController.getSessions));
/**
 * @route   DELETE /api/v1/auth/sessions/:sessionId
 * @desc    Revoke a specific session
 * @access  Private
 */
router.delete('/sessions/:sessionId', auth_middleware_js_1.authenticate, (0, error_middleware_js_1.asyncHandler)(auth_controller_js_1.authController.revokeSession));
// ===========================================
// Two-Factor Authentication Routes
// ===========================================
/**
 * @route   POST /api/v1/auth/2fa/enable
 * @desc    Enable 2FA (get QR code and secret)
 * @access  Private
 */
router.post('/2fa/enable', auth_middleware_js_1.authenticate, (0, error_middleware_js_1.asyncHandler)(auth_controller_js_1.authController.enableTwoFactor));
/**
 * @route   POST /api/v1/auth/2fa/verify
 * @desc    Verify and activate 2FA
 * @access  Private
 */
router.post('/2fa/verify', auth_middleware_js_1.authenticate, (0, error_middleware_js_1.asyncHandler)(auth_controller_js_1.authController.verifyTwoFactor));
/**
 * @route   POST /api/v1/auth/2fa/disable
 * @desc    Disable 2FA
 * @access  Private
 */
router.post('/2fa/disable', auth_middleware_js_1.authenticate, (0, error_middleware_js_1.asyncHandler)(auth_controller_js_1.authController.disableTwoFactor));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map