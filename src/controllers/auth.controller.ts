import { Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../utils/errors';

export const authController = {
  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      const result = await authService.register({
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
    } catch (error) {
      next(error);
    }
  },

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, twoFactorCode } = req.body;
      const userAgent = req.headers['user-agent'] || 'unknown';
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

      const result = await authService.login({
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
    } catch (error) {
      next(error);
    }
  },

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  async refreshToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        throw new AppError('Refresh token is required', 400);
      }

      const userAgent = req.headers['user-agent'] || 'unknown';
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

      const result = await authService.refreshToken(refreshToken, userAgent, ipAddress);

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
    } catch (error) {
      next(error);
    }
  },

  /**
   * Request password reset
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      await authService.requestPasswordReset(email);

      // Always return success to prevent email enumeration
      res.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reset password with token
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;

      await authService.resetPassword(token, password);

      res.json({
        success: true,
        message: 'Password has been reset successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify email address
   * GET /api/v1/auth/verify-email/:token
   */
  async verifyEmail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;

      await authService.verifyEmail(token);

      res.json({
        success: true,
        message: 'Email verified successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Resend verification email
   * POST /api/v1/auth/resend-verification
   */
  async resendVerification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      await authService.resendVerificationEmail(email);

      res.json({
        success: true,
        message: 'If your email is registered and unverified, you will receive a new verification link.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Enable two-factor authentication
   * POST /api/v1/auth/2fa/enable
   */
  async enableTwoFactor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const result = await authService.enableTwoFactor(req.user.id);

      res.json({
        success: true,
        message: 'Scan the QR code with your authenticator app',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify and activate two-factor authentication
   * POST /api/v1/auth/2fa/verify
   */
  async verifyTwoFactor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { code } = req.body;

      const backupCodes = await authService.verifyAndActivateTwoFactor(req.user.id, code);

      res.json({
        success: true,
        message: 'Two-factor authentication enabled successfully. Save your backup codes securely.',
        data: {
          backupCodes,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Disable two-factor authentication
   * POST /api/v1/auth/2fa/disable
   */
  async disableTwoFactor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { code } = req.body;

      await authService.disableTwoFactor(req.user.id, code);

      res.json({
        success: true,
        message: 'Two-factor authentication disabled successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current user session info
   * GET /api/v1/auth/me
   */
  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      res.json({
        success: true,
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all active sessions for user
   * GET /api/v1/auth/sessions
   */
  async getSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const sessions = await authService.getUserSessions(req.user.id);

      res.json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Revoke a specific session
   * DELETE /api/v1/auth/sessions/:sessionId
   */
  async revokeSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { sessionId } = req.params;

      await authService.revokeSession(req.user.id, sessionId);

      res.json({
        success: true,
        message: 'Session revoked successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Revoke all sessions except current
   * DELETE /api/v1/auth/sessions
   */
  async revokeAllSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const currentToken = req.cookies?.refreshToken || req.body.currentRefreshToken;

      await authService.revokeAllSessions(req.user.id, currentToken);

      res.json({
        success: true,
        message: 'All other sessions revoked successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Change password (authenticated)
   * POST /api/v1/auth/change-password
   */
  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { currentPassword, newPassword } = req.body;

      await authService.changePassword(req.user.id, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully.',
      });
    } catch (error) {
      next(error);
    }
  },
};
