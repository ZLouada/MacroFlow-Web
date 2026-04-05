/**
 * Google OAuth Service
 * 
 * Handles Google OAuth 2.0 authentication flow
 */

import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config/index';
import { BadRequestError } from '../utils/errors';
import { TokenPayload, RefreshTokenPayload, AuthenticatedUser, UserRole } from '../types/index';

const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token: string;
  refresh_token?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const generateTokens = async (
  userId: string,
  sessionId: string,
  email: string,
  role: UserRole
): Promise<AuthTokens> => {
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

export const googleOAuthService = {
  /**
   * Generate Google OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    if (!config.google.clientId) {
      throw new BadRequestError('Google OAuth is not configured');
    }

    const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      client_id: config.google.clientId,
      redirect_uri: config.google.callbackUrl,
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
  async exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
    if (!config.google.clientId || !config.google.clientSecret) {
      throw new BadRequestError('Google OAuth is not configured');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.google.callbackUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json() as { error_description?: string };
      throw new BadRequestError(error.error_description || 'Failed to exchange code for tokens');
    }

    return response.json() as Promise<GoogleTokenResponse>;
  },

  /**
   * Get user info from Google
   */
  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new BadRequestError('Failed to get user info from Google');
    }

    return response.json() as Promise<GoogleUserInfo>;
  },

  /**
   * Handle Google OAuth callback - authenticate or register user
   */
  async handleCallback(
    code: string,
    userAgent: string,
    ipAddress: string
  ): Promise<{
    user: AuthenticatedUser;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    isNewUser: boolean;
  }> {
    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(code);
    
    // Get user info from Google
    const googleUser = await this.getUserInfo(tokens.access_token);

    if (!googleUser.email) {
      throw new BadRequestError('Google account does not have an email address');
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() },
    });

    let isNewUser = false;

    if (!user) {
      // Create new user
      isNewUser = true;
      user = await prisma.user.create({
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
    } else if (!user.emailVerified && googleUser.verified_email) {
      // Update email verification status if Google has verified the email
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }

    // Create session
    const sessionId = uuidv4();
    const authTokens = await generateTokens(user.id, sessionId, user.email, user.role as UserRole);

    await prisma.session.create({
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
      accessToken: authTokens.accessToken,
      refreshToken: authTokens.refreshToken,
      expiresIn: authTokens.expiresIn,
      isNewUser,
    };
  },
};

export default googleOAuthService;
