import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const authController: {
    /**
     * Register a new user
     * POST /api/v1/auth/register
     */
    register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Login user
     * POST /api/v1/auth/login
     */
    login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Logout user
     * POST /api/v1/auth/logout
     */
    logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Refresh access token
     * POST /api/v1/auth/refresh
     */
    refreshToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Request password reset
     * POST /api/v1/auth/forgot-password
     */
    forgotPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Reset password with token
     * POST /api/v1/auth/reset-password
     */
    resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Verify email address
     * GET /api/v1/auth/verify-email/:token
     */
    verifyEmail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Resend verification email
     * POST /api/v1/auth/resend-verification
     */
    resendVerification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Enable two-factor authentication
     * POST /api/v1/auth/2fa/enable
     */
    enableTwoFactor(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Verify and activate two-factor authentication
     * POST /api/v1/auth/2fa/verify
     */
    verifyTwoFactor(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Disable two-factor authentication
     * POST /api/v1/auth/2fa/disable
     */
    disableTwoFactor(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get current user session info
     * GET /api/v1/auth/me
     */
    me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get all active sessions for user
     * GET /api/v1/auth/sessions
     */
    getSessions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Revoke a specific session
     * DELETE /api/v1/auth/sessions/:sessionId
     */
    revokeSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Revoke all sessions except current
     * DELETE /api/v1/auth/sessions
     */
    revokeAllSessions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Change password (authenticated)
     * POST /api/v1/auth/change-password
     */
    changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Redirect to Google OAuth
     * GET /api/v1/auth/google
     */
    googleAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Handle Google OAuth callback
     * GET /api/v1/auth/google/callback
     */
    googleCallback(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=auth.controller.d.ts.map