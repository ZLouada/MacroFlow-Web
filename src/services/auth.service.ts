import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { prisma } from '../config/database';
import { config } from '../config/index';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../utils/errors';
import {
  TokenPayload,
  RefreshTokenPayload,
  AuthenticatedUser,
  UserRole,
} from '../types/index';
import { emailService } from './email.service';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';
const BACKUP_CODES_COUNT = 10;

// ===========================================
// Helper Functions
// ===========================================

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const generateTokens = async (userId: string, sessionId: string, email: string, role: UserRole): Promise<AuthTokens> => {
  const accessPayload: TokenPayload = {
    userId,
    email,
    role,
    sessionId,
  };

  const refreshPayload: RefreshTokenPayload = {
    userId,
    sessionId,
  };

  const accessToken = jwt.sign(accessPayload, config.jwt.secret, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
  });

  const refreshToken = jwt.sign(refreshPayload, config.jwt.refreshSecret, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
  };
};

const parseExpiresIn = (expiresIn: string): number => {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
};

const generateBackupCodes = (): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

// ===========================================
// Auth Service
// ===========================================

export const authService = {
  /**
   * Register a new user
   */
  async register(data: { email: string; password: string; firstName: string; lastName: string }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    const name = `${data.firstName} ${data.lastName}`.trim();

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        name,
        preferences: {
          create: {},
        },
      },
    });

    // Create email verification token
    const verificationToken = uuidv4();
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email
    await emailService.sendVerificationEmail(user.email, user.name, verificationToken);

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
    };

    return { user: authenticatedUser };
  },

  /**
   * Login user
   */
  async login(data: {
    email: string;
    password: string;
    twoFactorCode?: string;
    userAgent: string;
    ipAddress: string;
  }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase(), deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!data.twoFactorCode) {
        return { requiresTwoFactor: true, user: null, accessToken: null, refreshToken: null, expiresIn: null };
      }

      if (!user.twoFactorSecret) {
        throw new BadRequestError('2FA not properly configured');
      }

      // Check if it's a backup code
      const backupCodes = (user.backupCodes as string[]) || [];
      const isBackupCode = backupCodes.includes(data.twoFactorCode);
      
      if (isBackupCode) {
        // Remove used backup code
        await prisma.user.update({
          where: { id: user.id },
          data: {
            backupCodes: backupCodes.filter(code => code !== data.twoFactorCode),
          },
        });
      } else {
        const isValidCode = authenticator.verify({
          token: data.twoFactorCode,
          secret: user.twoFactorSecret,
        });

        if (!isValidCode) {
          throw new UnauthorizedError('Invalid 2FA code');
        }
      }
    }

    // Create session
    const sessionId = uuidv4();
    const tokens = await generateTokens(user.id, sessionId, user.email, user.role as UserRole);

    await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + parseExpiresIn(REFRESH_TOKEN_EXPIRES)),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
    };

    return {
      user: authenticatedUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  },

  /**
   * Logout - invalidate refresh token
   */
  async logout(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as RefreshTokenPayload;
      
      await prisma.session.deleteMany({
        where: {
          id: payload.sessionId,
          refreshToken,
        },
      });
    } catch {
      // Token might be invalid or expired, that's ok for logout
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string, userAgent: string, ipAddress: string) {
    try {
      const payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as RefreshTokenPayload;

      const session = await prisma.session.findFirst({
        where: {
          id: payload.sessionId,
          userId: payload.userId,
          refreshToken,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });

      if (!session || session.user.deletedAt) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      // Generate new tokens
      const newSessionId = uuidv4();
      const tokens = await generateTokens(
        session.user.id,
        newSessionId,
        session.user.email,
        session.user.role as UserRole
      );

      // Delete old session and create new one
      await prisma.$transaction([
        prisma.session.delete({ where: { id: session.id } }),
        prisma.session.create({
          data: {
            id: newSessionId,
            userId: session.user.id,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: new Date(Date.now() + parseExpiresIn(REFRESH_TOKEN_EXPIRES)),
            ipAddress,
            userAgent,
          },
        }),
      ]);

      return tokens;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw error;
    }
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase(), deletedAt: null },
    });

    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Invalidate existing reset tokens
    await prisma.passwordReset.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Create new reset token
    const token = uuidv4();
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, user.name, token);
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string) {
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!resetRecord) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
      // Invalidate all sessions
      prisma.session.deleteMany({
        where: { userId: resetRecord.userId },
      }),
    ]);
  },

  /**
   * Verify email address
   */
  async verifyEmail(token: string) {
    const verification = await prisma.emailVerification.findFirst({
      where: {
        token,
        verified: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: true },
      }),
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { verified: true },
      }),
    ]);
  },

  /**
   * Resend verification email (by email address)
   */
  async resendVerificationEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase(), deletedAt: null },
    });

    if (!user) {
      // Don't reveal if email exists
      return;
    }

    if (user.emailVerified) {
      // Don't reveal verification status
      return;
    }

    // Invalidate existing tokens
    await prisma.emailVerification.updateMany({
      where: { userId: user.id, verified: false },
      data: { verified: true },
    });

    // Create new token
    const token = uuidv4();
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    await emailService.sendVerificationEmail(user.email, user.name, token);
  },

  /**
   * Enable two-factor authentication (generates QR code)
   */
  async enableTwoFactor(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestError('2FA is already enabled');
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'MacroFlow', secret);
    const qrCode = await QRCode.toDataURL(otpauth);

    // Store secret temporarily (will be confirmed on verify)
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    return { secret, qrCode };
  },

  /**
   * Verify and activate two-factor authentication
   * Returns backup codes on successful activation
   */
  async verifyAndActivateTwoFactor(userId: string, code: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestError('2FA setup not initiated');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new BadRequestError('Invalid verification code');
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        backupCodes,
      },
    });

    return backupCodes;
  },

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(userId: string, code: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestError('2FA is not enabled');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new BadRequestError('Invalid verification code');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: [],
      },
    });
  },

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string) {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions;
  },

  /**
   * Revoke a specific session
   */
  async revokeSession(userId: string, sessionId: string) {
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    await prisma.session.delete({
      where: { id: sessionId },
    });
  },

  /**
   * Revoke all sessions except the current one
   */
  async revokeAllSessions(userId: string, currentRefreshToken?: string) {
    let currentSessionId: string | null = null;

    if (currentRefreshToken) {
      try {
        const payload = jwt.verify(currentRefreshToken, config.jwt.refreshSecret) as RefreshTokenPayload;
        currentSessionId = payload.sessionId;
      } catch {
        // Invalid token, we'll revoke all sessions
      }
    }

    if (currentSessionId) {
      await prisma.session.deleteMany({
        where: {
          userId,
          id: { not: currentSessionId },
        },
      });
    } else {
      await prisma.session.deleteMany({
        where: { userId },
      });
    }
  },

  /**
   * Change password (authenticated user)
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new BadRequestError('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Optionally: invalidate all other sessions
    // await this.revokeAllSessions(userId);
  },

  /**
   * Get current user info
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      preferences: user.preferences,
      createdAt: user.createdAt,
    };
  },
};

export default authService;
