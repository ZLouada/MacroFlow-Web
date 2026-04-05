"use strict";
/**
 * Google OAuth Service
 *
 * Handles Google OAuth 2.0 authentication flow
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleOAuthService = void 0;
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_js_1 = require("../config/database.js");
const index_js_1 = require("../config/index.js");
const errors_js_1 = require("../utils/errors.js");
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';
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
    const accessToken = jsonwebtoken_1.default.sign(accessPayload, index_js_1.config.jwt.secret, {
        expiresIn: ACCESS_TOKEN_EXPIRES,
    });
    const refreshToken = jsonwebtoken_1.default.sign(refreshPayload, index_js_1.config.jwt.refreshSecret, {
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
exports.googleOAuthService = {
    /**
     * Generate Google OAuth authorization URL
     */
    getAuthorizationUrl(state) {
        if (!index_js_1.config.google.clientId) {
            throw new errors_js_1.BadRequestError('Google OAuth is not configured');
        }
        const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const params = new URLSearchParams({
            client_id: index_js_1.config.google.clientId,
            redirect_uri: `${index_js_1.config.frontend.url}${index_js_1.config.google.callbackUrl}`,
            response_type: 'code',
            scope: 'openid email profile',
            access_type: 'offline',
            prompt: 'consent',
            ...(state && { state }),
        });
        return `${baseUrl}?${params.toString()}`;
    },
    /**
     * Exchange authorization code for tokens
     */
    async exchangeCodeForTokens(code) {
        if (!index_js_1.config.google.clientId || !index_js_1.config.google.clientSecret) {
            throw new errors_js_1.BadRequestError('Google OAuth is not configured');
        }
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: index_js_1.config.google.clientId,
                client_secret: index_js_1.config.google.clientSecret,
                code,
                grant_type: 'authorization_code',
                redirect_uri: `${index_js_1.config.frontend.url}${index_js_1.config.google.callbackUrl}`,
            }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new errors_js_1.BadRequestError(error.error_description || 'Failed to exchange code for tokens');
        }
        return response.json();
    },
    /**
     * Get user info from Google
     */
    async getUserInfo(accessToken) {
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            throw new errors_js_1.BadRequestError('Failed to get user info from Google');
        }
        return response.json();
    },
    /**
     * Handle Google OAuth callback - authenticate or register user
     */
    async handleCallback(code, userAgent, ipAddress) {
        // Exchange code for tokens
        const tokens = await this.exchangeCodeForTokens(code);
        // Get user info from Google
        const googleUser = await this.getUserInfo(tokens.access_token);
        if (!googleUser.email) {
            throw new errors_js_1.BadRequestError('Google account does not have an email address');
        }
        // Check if user exists
        let user = await database_js_1.prisma.user.findUnique({
            where: { email: googleUser.email.toLowerCase() },
        });
        let isNewUser = false;
        if (!user) {
            // Create new user
            isNewUser = true;
            user = await database_js_1.prisma.user.create({
                data: {
                    email: googleUser.email.toLowerCase(),
                    password: '', // No password for OAuth users
                    name: googleUser.name || googleUser.email.split('@')[0],
                    avatar: googleUser.picture,
                    emailVerified: googleUser.verified_email,
                    preferences: {
                        create: {},
                    },
                },
            });
        }
        else if (!user.emailVerified && googleUser.verified_email) {
            // Update email verification status if Google has verified the email
            user = await database_js_1.prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: true },
            });
        }
        // Create session
        const sessionId = (0, uuid_1.v4)();
        const authTokens = await generateTokens(user.id, sessionId, user.email, user.role);
        await database_js_1.prisma.session.create({
            data: {
                id: sessionId,
                userId: user.id,
                token: authTokens.accessToken,
                refreshToken: authTokens.refreshToken,
                expiresAt: new Date(Date.now() + parseExpiresIn(REFRESH_TOKEN_EXPIRES)),
                ipAddress,
                userAgent,
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
            accessToken: authTokens.accessToken,
            refreshToken: authTokens.refreshToken,
            expiresIn: authTokens.expiresIn,
            isNewUser,
        };
    },
};
exports.default = exports.googleOAuthService;
//# sourceMappingURL=google-oauth.service.js.map