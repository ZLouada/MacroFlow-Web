"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("../services/auth.service");
const errors_1 = require("../utils/errors");
exports.authController = {
    /**
     * Register a new user
     * POST /api/v1/auth/register
     */
    async register(req, res, next) {
        try {
            const { email, password, firstName, lastName } = req.body;
            const result = await auth_service_1.authService.register({
                email,
                password,
                firstName,
                lastName,
            });
            res.status(201).json({
                success: true,
                message: 'Registration successful. Please check your email to verify your account.',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Login user
     * POST /api/v1/auth/login
     */
    async login(req, res, next) {
        try {
            const { email, password, twoFactorCode } = req.body;
            const userAgent = req.headers['user-agent'] || 'unknown';
            const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
            const result = await auth_service_1.authService.login({
                email,
                password,
                twoFactorCode,
                userAgent,
                ipAddress,
            });
            // Set refresh token as HTTP-only cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                    expiresIn: result.expiresIn,
                },
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Logout user
     * POST /api/v1/auth/logout
     */
    async logout(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
            if (refreshToken) {
                await auth_service_1.authService.logout(refreshToken);
            }
            res.clearCookie('refreshToken');
            res.json({
                success: true,
                message: 'Logged out successfully',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Refresh access token
     * POST /api/v1/auth/refresh
     */
    async refreshToken(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
            if (!refreshToken) {
                throw new errors_1.AppError('Refresh token is required', 400);
            }
            const userAgent = req.headers['user-agent'] || 'unknown';
            const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
            const result = await auth_service_1.authService.refreshToken(refreshToken, userAgent, ipAddress);
            // Update refresh token cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.json({
                success: true,
                data: {
                    accessToken: result.accessToken,
                    expiresIn: result.expiresIn,
                },
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Request password reset
     * POST /api/v1/auth/forgot-password
     */
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            await auth_service_1.authService.requestPasswordReset(email);
            // Always return success to prevent email enumeration
            res.json({
                success: true,
                message: 'If your email is registered, you will receive a password reset link.',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Reset password with token
     * POST /api/v1/auth/reset-password
     */
    async resetPassword(req, res, next) {
        try {
            const { token, password } = req.body;
            await auth_service_1.authService.resetPassword(token, password);
            res.json({
                success: true,
                message: 'Password has been reset successfully.',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Verify email address
     * GET /api/v1/auth/verify-email/:token
     */
    async verifyEmail(req, res, next) {
        try {
            const { token } = req.params;
            await auth_service_1.authService.verifyEmail(token);
            res.json({
                success: true,
                message: 'Email verified successfully.',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Resend verification email
     * POST /api/v1/auth/resend-verification
     */
    async resendVerification(req, res, next) {
        try {
            const { email } = req.body;
            await auth_service_1.authService.resendVerificationEmail(email);
            res.json({
                success: true,
                message: 'If your email is registered and unverified, you will receive a new verification link.',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Enable two-factor authentication
     * POST /api/v1/auth/2fa/enable
     */
    async enableTwoFactor(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const result = await auth_service_1.authService.enableTwoFactor(req.user.id);
            res.json({
                success: true,
                message: 'Scan the QR code with your authenticator app',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Verify and activate two-factor authentication
     * POST /api/v1/auth/2fa/verify
     */
    async verifyTwoFactor(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { code } = req.body;
            const backupCodes = await auth_service_1.authService.verifyAndActivateTwoFactor(req.user.id, code);
            res.json({
                success: true,
                message: 'Two-factor authentication enabled successfully. Save your backup codes securely.',
                data: {
                    backupCodes,
                },
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Disable two-factor authentication
     * POST /api/v1/auth/2fa/disable
     */
    async disableTwoFactor(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { code } = req.body;
            await auth_service_1.authService.disableTwoFactor(req.user.id, code);
            res.json({
                success: true,
                message: 'Two-factor authentication disabled successfully.',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get current user session info
     * GET /api/v1/auth/me
     */
    async me(req, res, next) {
        try {
            if (!req.user) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            res.json({
                success: true,
                data: {
                    user: req.user,
                },
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get all active sessions for user
     * GET /api/v1/auth/sessions
     */
    async getSessions(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const sessions = await auth_service_1.authService.getUserSessions(req.user.id);
            res.json({
                success: true,
                data: sessions,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Revoke a specific session
     * DELETE /api/v1/auth/sessions/:sessionId
     */
    async revokeSession(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { sessionId } = req.params;
            await auth_service_1.authService.revokeSession(req.user.id, sessionId);
            res.json({
                success: true,
                message: 'Session revoked successfully.',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Revoke all sessions except current
     * DELETE /api/v1/auth/sessions
     */
    async revokeAllSessions(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const currentToken = req.cookies?.refreshToken || req.body.currentRefreshToken;
            await auth_service_1.authService.revokeAllSessions(req.user.id, currentToken);
            res.json({
                success: true,
                message: 'All other sessions revoked successfully.',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Change password (authenticated)
     * POST /api/v1/auth/change-password
     */
    async changePassword(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { currentPassword, newPassword } = req.body;
            await auth_service_1.authService.changePassword(req.user.id, currentPassword, newPassword);
            res.json({
                success: true,
                message: 'Password changed successfully.',
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=auth.controller.js.map