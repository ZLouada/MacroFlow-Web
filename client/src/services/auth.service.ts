/**
 * Auth Service
 * 
 * Handles all authentication-related API calls.
 */

import api, { setAccessToken, setRefreshToken, clearTokens, ApiError } from './api';

// ============================================================================
// Types
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUserResponse;
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor?: boolean;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  preferences: {
    theme: string;
    language: string;
    notifications: Record<string, boolean>;
    dashboardLayout: {
      widgets: string[];
      columns: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
}

// ============================================================================
// Auth Service
// ============================================================================

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    
    if (!response.requiresTwoFactor) {
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
    }
    
    return response;
  },

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<{ message: string }> {
    return api.post('/auth/register', data);
  },

  /**
   * Verify two-factor authentication code
   */
  async verifyTwoFactor(code: string, tempToken: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/verify-2fa', { code, tempToken });
    
    setAccessToken(response.accessToken);
    setRefreshToken(response.refreshToken);
    
    return response;
  },

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    return api.post('/auth/verify-email', { token });
  },

  /**
   * Logout current session
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      clearTokens();
    }
  },

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<void> {
    try {
      await api.post('/auth/logout-all');
    } finally {
      clearTokens();
    }
  },

  /**
   * Get current user profile
   */
  async me(): Promise<AuthUserResponse> {
    return api.get('/auth/me');
  },

  /**
   * Request password reset email
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return api.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return api.post('/auth/reset-password', { token, password: newPassword });
  },

  /**
   * Change password (when logged in)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return api.post('/auth/change-password', { currentPassword, newPassword });
  },

  /**
   * Resend verification email
   */
  async resendVerification(): Promise<{ message: string }> {
    return api.post('/auth/resend-verification');
  },

  /**
   * Get all active sessions
   */
  async getSessions(): Promise<{ sessions: Array<{ id: string; device: string; lastActive: string; current: boolean }> }> {
    return api.get('/auth/sessions');
  },

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string): Promise<{ message: string }> {
    return api.delete(`/auth/sessions/${sessionId}`);
  },

  /**
   * Setup two-factor authentication (get QR code)
   */
  async setupTwoFactor(): Promise<TwoFactorSetupResponse> {
    return api.post('/auth/2fa/enable');
  },

  /**
   * Verify and activate two-factor authentication
   */
  async verifyTwoFactor2FA(code: string): Promise<{ backupCodes: string[] }> {
    return api.post('/auth/2fa/verify', { code });
  },

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(code: string): Promise<{ message: string }> {
    return api.post('/auth/2fa/disable', { code });
  },

  /**
   * Check if the API error is an authentication error
   */
  isAuthError(error: unknown): boolean {
    return (error as ApiError)?.status === 401;
  },
};

export default authService;
