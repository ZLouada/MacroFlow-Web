/**
 * Google OAuth Service
 *
 * Handles Google OAuth 2.0 authentication flow
 */
import { AuthenticatedUser } from '../types/index';
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
export declare const googleOAuthService: {
    /**
     * Generate Google OAuth authorization URL
     */
    getAuthorizationUrl(state?: string): string;
    /**
     * Exchange authorization code for tokens
     */
    exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse>;
    /**
     * Get user info from Google
     */
    getUserInfo(accessToken: string): Promise<GoogleUserInfo>;
    /**
     * Handle Google OAuth callback - authenticate or register user
     */
    handleCallback(code: string, userAgent: string, ipAddress: string): Promise<{
        user: AuthenticatedUser;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        isNewUser: boolean;
    }>;
};
export default googleOAuthService;
//# sourceMappingURL=google-oauth.service.d.ts.map