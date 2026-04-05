import { AuthenticatedUser } from '../types/index.js';
interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export declare const authService: {
    /**
     * Register a new user
     */
    register(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }): Promise<{
        user: AuthenticatedUser;
    }>;
    /**
     * Login user
     */
    login(data: {
        email: string;
        password: string;
        twoFactorCode?: string;
        userAgent: string;
        ipAddress: string;
    }): Promise<{
        requiresTwoFactor: boolean;
        user: null;
        accessToken: null;
        refreshToken: null;
        expiresIn: null;
    } | {
        user: AuthenticatedUser;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        requiresTwoFactor?: undefined;
    }>;
    /**
     * Logout - invalidate refresh token
     */
    logout(refreshToken: string): Promise<void>;
    /**
     * Refresh access token
     */
    refreshToken(refreshToken: string, userAgent: string, ipAddress: string): Promise<AuthTokens>;
    /**
     * Request password reset
     */
    requestPasswordReset(email: string): Promise<void>;
    /**
     * Reset password with token
     */
    resetPassword(token: string, password: string): Promise<void>;
    /**
     * Verify email address
     */
    verifyEmail(token: string): Promise<void>;
    /**
     * Resend verification email (by email address)
     */
    resendVerificationEmail(email: string): Promise<void>;
    /**
     * Enable two-factor authentication (generates QR code)
     */
    enableTwoFactor(userId: string): Promise<{
        secret: string;
        qrCode: string;
    }>;
    /**
     * Verify and activate two-factor authentication
     * Returns backup codes on successful activation
     */
    verifyAndActivateTwoFactor(userId: string, code: string): Promise<string[]>;
    /**
     * Disable two-factor authentication
     */
    disableTwoFactor(userId: string, code: string): Promise<void>;
    /**
     * Get all active sessions for a user
     */
    getUserSessions(userId: string): Promise<{
        id: string;
        expiresAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
    }[]>;
    /**
     * Revoke a specific session
     */
    revokeSession(userId: string, sessionId: string): Promise<void>;
    /**
     * Revoke all sessions except the current one
     */
    revokeAllSessions(userId: string, currentRefreshToken?: string): Promise<void>;
    /**
     * Change password (authenticated user)
     */
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    /**
     * Get current user info
     */
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatar: string | null;
        emailVerified: boolean;
        twoFactorEnabled: boolean;
        preferences: {
            id: string;
            userId: string;
            theme: import(".prisma/client").$Enums.Theme;
            language: import(".prisma/client").$Enums.Language;
            notifyEmail: boolean;
            notifyPush: boolean;
            notifyTaskAssigned: boolean;
            notifyTaskCompleted: boolean;
            notifyTaskOverdue: boolean;
            notifyMentions: boolean;
            dashboardLayout: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        createdAt: Date;
    }>;
};
export default authService;
//# sourceMappingURL=auth.service.d.ts.map