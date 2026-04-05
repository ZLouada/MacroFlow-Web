/**
 * Authentication Provider
 * 
 * Provides authentication context throughout the app with support for:
 * - Email/Password login
 * - Sign up with email verification
 * - Two-Factor Authentication (2FA)
 * - Session management
 * 
 * Now connected to real backend API (Phase 3)
 */

import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { User, UserRole } from '@/types';
import { authService, getAccessToken, clearTokens, ApiError } from '@/services';

// ============================================================================
// Types
// ============================================================================

export interface AuthUser extends User {
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
}

export type AuthStep = 'idle' | 'credentials' | '2fa' | 'verification' | 'complete';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authStep: AuthStep;
  pendingEmail?: string;
  tempToken?: string; // For 2FA flow
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface SignUpData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ requiresTwoFactor: boolean }>;
  verifyTwoFactor: (code: string) => Promise<boolean>;
  signUp: (data: SignUpData) => Promise<boolean>;
  verifyEmail: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  enableTwoFactor: () => Promise<{ secret: string; qrCode: string }>;
  disableTwoFactor: (code: string) => Promise<boolean>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  clearError: () => void;
  resendVerificationEmail: () => Promise<boolean>;
}

// ============================================================================
// Helper Functions
// ============================================================================

function mapApiUserToAuthUser(apiUser: any): AuthUser {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    role: apiUser.role as UserRole,
    avatar: apiUser.avatar,
    twoFactorEnabled: apiUser.twoFactorEnabled,
    emailVerified: apiUser.emailVerified,
    preferences: apiUser.preferences || {
      theme: 'system',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        taskAssigned: true,
        taskCompleted: true,
        taskOverdue: true,
        mentions: true,
      },
      dashboardLayout: {
        widgets: [],
        columns: 3,
      },
    },
    createdAt: new Date(apiUser.createdAt),
    updatedAt: new Date(apiUser.updatedAt),
  };
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// ============================================================================
// Provider
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    authStep: 'idle',
    error: null,
  });
  
  const initRef = useRef(false);

  // Check for existing session on mount
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    
    const checkSession = async () => {
      const token = getAccessToken();
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const apiUser = await authService.me();
        const user = mapApiUserToAuthUser(apiUser);
        
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          authStep: 'complete',
          error: null,
        });
      } catch (error) {
        console.error('Session check failed:', error);
        clearTokens();
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkSession();
  }, []);

  // Login with credentials
  const login = useCallback(async (credentials: LoginCredentials): Promise<{ requiresTwoFactor: boolean }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.login({
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe,
      });

      if (response.requiresTwoFactor) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          authStep: '2fa',
          pendingEmail: credentials.email,
          // Store temp token for 2FA verification if provided
          tempToken: (response as any).tempToken,
        }));
        return { requiresTwoFactor: true };
      }

      const user = mapApiUserToAuthUser(response.user);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        authStep: 'complete',
        error: null,
      });

      return { requiresTwoFactor: false };
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.message || 'Login failed. Please try again.';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  }, []);

  // Verify 2FA code
  const verifyTwoFactor = useCallback(async (code: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const tempToken = state.tempToken || '';
      const response = await authService.verifyTwoFactor(code, tempToken);
      
      const user = mapApiUserToAuthUser(response.user);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        authStep: 'complete',
        error: null,
        tempToken: undefined,
        pendingEmail: undefined,
      });

      return true;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError.message || 'Invalid verification code',
      }));
      return false;
    }
  }, [state.tempToken]);

  // Sign up
  const signUp = useCallback(async (data: SignUpData): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    if (data.password !== data.confirmPassword) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Passwords do not match',
      }));
      return false;
    }

    try {
      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authStep: 'verification',
        pendingEmail: data.email,
        error: null,
      });

      return true;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError.message || 'Registration failed. Please try again.',
      }));
      return false;
    }
  }, []);

  // Verify email
  const verifyEmail = useCallback(async (token: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authService.verifyEmail(token);

      setState(prev => ({
        ...prev,
        isLoading: false,
        authStep: 'idle',
        pendingEmail: undefined,
        error: null,
      }));

      return true;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError.message || 'Email verification failed',
      }));
      return false;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
    }
    
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      authStep: 'idle',
      error: null,
    });
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authService.forgotPassword(email);
      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError.message || 'Failed to send reset email',
      }));
      return false;
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authService.changePassword(oldPassword, newPassword);
      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError.message || 'Failed to update password',
      }));
      return false;
    }
  }, []);

  // Enable 2FA
  const enableTwoFactor = useCallback(async (): Promise<{ secret: string; qrCode: string }> => {
    try {
      const response = await authService.setupTwoFactor();
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to setup 2FA');
    }
  }, []);

  // Disable 2FA
  const disableTwoFactor = useCallback(async (code: string): Promise<boolean> => {
    try {
      await authService.disableTwoFactor(code);
      
      setState(prev => {
        if (prev.user) {
          return {
            ...prev,
            user: { ...prev.user, twoFactorEnabled: false },
          };
        }
        return prev;
      });

      return true;
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      return false;
    }
  }, []);

  // Check role
  const hasRole = useCallback((roles: UserRole | UserRole[]): boolean => {
    if (!state.user) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(state.user.role);
  }, [state.user]);

  // Check permission
  const hasPermission = useCallback((permission: string): boolean => {
    if (!state.user) return false;

    const permissions: Record<UserRole, string[]> = {
      admin: ['*'],
      coo: ['view:all', 'edit:projects', 'view:reports', 'manage:team', 'export:data'],
      projectManager: ['view:projects', 'edit:projects', 'manage:tasks', 'view:team', 'assign:tasks'],
      teamLead: ['view:projects', 'edit:tasks', 'assign:tasks', 'view:team'],
      developer: ['view:projects', 'edit:own-tasks', 'comment:tasks'],
      designer: ['view:projects', 'edit:own-tasks', 'comment:tasks'],
      viewer: ['view:projects', 'view:tasks'],
    };

    const userPermissions = permissions[state.user.role];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }, [state.user]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Resend verification email
  const resendVerificationEmail = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authService.resendVerification();
      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      console.error('Failed to resend verification:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        verifyTwoFactor,
        signUp,
        verifyEmail,
        logout,
        resetPassword,
        updatePassword,
        enableTwoFactor,
        disableTwoFactor,
        hasRole,
        hasPermission,
        clearError,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
