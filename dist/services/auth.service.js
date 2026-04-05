"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
const otplib_1 = require("otplib");
const qrcode_1 = __importDefault(require("qrcode"));
const database_1 = require("../config/database");
const index_1 = require("../config/index");
const errors_1 = require("../utils/errors");
const email_service_1 = require("./email.service");
const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';
const BACKUP_CODES_COUNT = 10;
const generateTokens = async (userId, sessionId, email, role) => {
    const accessPayload = {
        userId,
        email,
        role,
        sessionId,
    };
    const refreshPayload = {
        userId,
        sessionId,
    };
    const accessToken = jsonwebtoken_1.default.sign(accessPayload, index_1.config.jwt.secret, {
        expiresIn: ACCESS_TOKEN_EXPIRES,
    });
    const refreshToken = jsonwebtoken_1.default.sign(refreshPayload, index_1.config.jwt.refreshSecret, {
        expiresIn: REFRESH_TOKEN_EXPIRES,
    });
    return {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
    };
};
const parseExpiresIn = (expiresIn) => {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match)
        return 7 * 24 * 60 * 60 * 1000; // Default 7 days
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
const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
        codes.push(crypto_1.default.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
};
// ===========================================
// Auth Service
// ===========================================
exports.authService = {
    /**
     * Register a new user
     */
    async register(data) {
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });
        if (existingUser) {
            throw new errors_1.ConflictError('Email already registered');
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, SALT_ROUNDS);
        const name = `${data.firstName} ${data.lastName}`.trim();
        const user = await database_1.prisma.user.create({
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
        const verificationToken = (0, uuid_1.v4)();
        await database_1.prisma.emailVerification.create({
            data: {
                userId: user.id,
                token: verificationToken,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            },
        });
        // Send verification email
        await email_service_1.emailService.sendVerificationEmail(user.email, user.name, verificationToken);
        const authenticatedUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            emailVerified: user.emailVerified,
            twoFactorEnabled: user.twoFactorEnabled,
        };
        return { user: authenticatedUser };
    },
    /**
     * Login user
     */
    async login(data) {
        const user = await database_1.prisma.user.findUnique({
            where: { email: data.email.toLowerCase(), deletedAt: null },
        });
        if (!user) {
            throw new errors_1.UnauthorizedError('Invalid email or password');
        }
        const isValidPassword = await bcryptjs_1.default.compare(data.password, user.password);
        if (!isValidPassword) {
            throw new errors_1.UnauthorizedError('Invalid email or password');
        }
        // Check 2FA if enabled
        if (user.twoFactorEnabled) {
            if (!data.twoFactorCode) {
                return { requiresTwoFactor: true, user: null, accessToken: null, refreshToken: null, expiresIn: null };
            }
            if (!user.twoFactorSecret) {
                throw new errors_1.BadRequestError('2FA not properly configured');
            }
            // Check if it's a backup code
            const backupCodes = user.backupCodes || [];
            const isBackupCode = backupCodes.includes(data.twoFactorCode);
            if (isBackupCode) {
                // Remove used backup code
                await database_1.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        backupCodes: backupCodes.filter(code => code !== data.twoFactorCode),
                    },
                });
            }
            else {
                const isValidCode = otplib_1.authenticator.verify({
                    token: data.twoFactorCode,
                    secret: user.twoFactorSecret,
                });
                if (!isValidCode) {
                    throw new errors_1.UnauthorizedError('Invalid 2FA code');
                }
            }
        }
        // Create session
        const sessionId = (0, uuid_1.v4)();
        const tokens = await generateTokens(user.id, sessionId, user.email, user.role);
        await database_1.prisma.session.create({
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
        const authenticatedUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
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
    async logout(refreshToken) {
        try {
            const payload = jsonwebtoken_1.default.verify(refreshToken, index_1.config.jwt.refreshSecret);
            await database_1.prisma.session.deleteMany({
                where: {
                    id: payload.sessionId,
                    refreshToken,
                },
            });
        }
        catch {
            // Token might be invalid or expired, that's ok for logout
        }
    },
    /**
     * Refresh access token
     */
    async refreshToken(refreshToken, userAgent, ipAddress) {
        try {
            const payload = jsonwebtoken_1.default.verify(refreshToken, index_1.config.jwt.refreshSecret);
            const session = await database_1.prisma.session.findFirst({
                where: {
                    id: payload.sessionId,
                    userId: payload.userId,
                    refreshToken,
                    expiresAt: { gt: new Date() },
                },
                include: { user: true },
            });
            if (!session || session.user.deletedAt) {
                throw new errors_1.UnauthorizedError('Invalid or expired refresh token');
            }
            // Generate new tokens
            const newSessionId = (0, uuid_1.v4)();
            const tokens = await generateTokens(session.user.id, newSessionId, session.user.email, session.user.role);
            // Delete old session and create new one
            await database_1.prisma.$transaction([
                database_1.prisma.session.delete({ where: { id: session.id } }),
                database_1.prisma.session.create({
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
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new errors_1.UnauthorizedError('Invalid refresh token');
            }
            throw error;
        }
    },
    /**
     * Request password reset
     */
    async requestPasswordReset(email) {
        const user = await database_1.prisma.user.findUnique({
            where: { email: email.toLowerCase(), deletedAt: null },
        });
        if (!user) {
            // Don't reveal if email exists
            return;
        }
        // Invalidate existing reset tokens
        await database_1.prisma.passwordReset.updateMany({
            where: { userId: user.id, used: false },
            data: { used: true },
        });
        // Create new reset token
        const token = (0, uuid_1.v4)();
        await database_1.prisma.passwordReset.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
            },
        });
        // Send reset email
        await email_service_1.emailService.sendPasswordResetEmail(user.email, user.name, token);
    },
    /**
     * Reset password with token
     */
    async resetPassword(token, password) {
        const resetRecord = await database_1.prisma.passwordReset.findFirst({
            where: {
                token,
                used: false,
                expiresAt: { gt: new Date() },
            },
            include: { user: true },
        });
        if (!resetRecord) {
            throw new errors_1.BadRequestError('Invalid or expired reset token');
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, SALT_ROUNDS);
        await database_1.prisma.$transaction([
            database_1.prisma.user.update({
                where: { id: resetRecord.userId },
                data: { password: hashedPassword },
            }),
            database_1.prisma.passwordReset.update({
                where: { id: resetRecord.id },
                data: { used: true },
            }),
            // Invalidate all sessions
            database_1.prisma.session.deleteMany({
                where: { userId: resetRecord.userId },
            }),
        ]);
    },
    /**
     * Verify email address
     */
    async verifyEmail(token) {
        const verification = await database_1.prisma.emailVerification.findFirst({
            where: {
                token,
                verified: false,
                expiresAt: { gt: new Date() },
            },
        });
        if (!verification) {
            throw new errors_1.BadRequestError('Invalid or expired verification token');
        }
        await database_1.prisma.$transaction([
            database_1.prisma.user.update({
                where: { id: verification.userId },
                data: { emailVerified: true },
            }),
            database_1.prisma.emailVerification.update({
                where: { id: verification.id },
                data: { verified: true },
            }),
        ]);
    },
    /**
     * Resend verification email (by email address)
     */
    async resendVerificationEmail(email) {
        const user = await database_1.prisma.user.findUnique({
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
        await database_1.prisma.emailVerification.updateMany({
            where: { userId: user.id, verified: false },
            data: { verified: true },
        });
        // Create new token
        const token = (0, uuid_1.v4)();
        await database_1.prisma.emailVerification.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            },
        });
        await email_service_1.emailService.sendVerificationEmail(user.email, user.name, token);
    },
    /**
     * Enable two-factor authentication (generates QR code)
     */
    async enableTwoFactor(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (user.twoFactorEnabled) {
            throw new errors_1.BadRequestError('2FA is already enabled');
        }
        const secret = otplib_1.authenticator.generateSecret();
        const otpauth = otplib_1.authenticator.keyuri(user.email, 'MacroFlow', secret);
        const qrCode = await qrcode_1.default.toDataURL(otpauth);
        // Store secret temporarily (will be confirmed on verify)
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: secret },
        });
        return { secret, qrCode };
    },
    /**
     * Verify and activate two-factor authentication
     * Returns backup codes on successful activation
     */
    async verifyAndActivateTwoFactor(userId, code) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.twoFactorSecret) {
            throw new errors_1.BadRequestError('2FA setup not initiated');
        }
        const isValid = otplib_1.authenticator.verify({
            token: code,
            secret: user.twoFactorSecret,
        });
        if (!isValid) {
            throw new errors_1.BadRequestError('Invalid verification code');
        }
        // Generate backup codes
        const backupCodes = generateBackupCodes();
        await database_1.prisma.user.update({
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
    async disableTwoFactor(userId, code) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (!user.twoFactorEnabled || !user.twoFactorSecret) {
            throw new errors_1.BadRequestError('2FA is not enabled');
        }
        const isValid = otplib_1.authenticator.verify({
            token: code,
            secret: user.twoFactorSecret,
        });
        if (!isValid) {
            throw new errors_1.BadRequestError('Invalid verification code');
        }
        await database_1.prisma.user.update({
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
    async getUserSessions(userId) {
        const sessions = await database_1.prisma.session.findMany({
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
    async revokeSession(userId, sessionId) {
        const session = await database_1.prisma.session.findFirst({
            where: {
                id: sessionId,
                userId,
            },
        });
        if (!session) {
            throw new errors_1.NotFoundError('Session not found');
        }
        await database_1.prisma.session.delete({
            where: { id: sessionId },
        });
    },
    /**
     * Revoke all sessions except the current one
     */
    async revokeAllSessions(userId, currentRefreshToken) {
        let currentSessionId = null;
        if (currentRefreshToken) {
            try {
                const payload = jsonwebtoken_1.default.verify(currentRefreshToken, index_1.config.jwt.refreshSecret);
                currentSessionId = payload.sessionId;
            }
            catch {
                // Invalid token, we'll revoke all sessions
            }
        }
        if (currentSessionId) {
            await database_1.prisma.session.deleteMany({
                where: {
                    userId,
                    id: { not: currentSessionId },
                },
            });
        }
        else {
            await database_1.prisma.session.deleteMany({
                where: { userId },
            });
        }
    },
    /**
     * Change password (authenticated user)
     */
    async changePassword(userId, currentPassword, newPassword) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValidPassword) {
            throw new errors_1.BadRequestError('Current password is incorrect');
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, SALT_ROUNDS);
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        // Optionally: invalidate all other sessions
        // await this.revokeAllSessions(userId);
    },
    /**
     * Get current user info
     */
    async getMe(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            include: { preferences: true },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
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
exports.default = exports.authService;
//# sourceMappingURL=auth.service.js.map