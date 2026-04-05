import { AuthTokens, AuthenticatedUser } from '../types/index.js';
export declare const authService: {
    register(data: {
        email: string;
        password: string;
        name: string;
    }, ipAddress?: string, userAgent?: string): Promise<{
        tokens: AuthTokens;
        user: AuthenticatedUser;
    }>;
    login(data: {
        email: string;
        password: string;
        twoFactorCode?: string;
    }, ipAddress?: string, userAgent?: string): Promise<{
        requiresTwoFactor: boolean;
        tokens?: undefined;
        user?: undefined;
    } | {
        tokens: AuthTokens;
        user: AuthenticatedUser;
        requiresTwoFactor?: undefined;
    }>;
    logout(sessionId: string): Promise<void>;
    refresh(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<AuthTokens>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    verifyEmail(token: string): Promise<void>;
    resendVerification(userId: string): Promise<void>;
    enable2FA(userId: string): Promise<{
        secret: string;
        qrCode: string;
    }>;
    verify2FA(userId: string, code: string): Promise<void>;
    disable2FA(userId: string, code: string): Promise<void>;
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