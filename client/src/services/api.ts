/**
 * API Service
 * 
 * Central HTTP client for making API requests to the backend.
 * Handles authentication tokens, request/response interceptors, and error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// ============================================================================
// Types
// ============================================================================

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

// ============================================================================
// Token Management
// ============================================================================

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    localStorage.setItem('macroflow_access_token', token);
  } else {
    localStorage.removeItem('macroflow_access_token');
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  accessToken = localStorage.getItem('macroflow_access_token');
  return accessToken;
}

export function setRefreshToken(token: string | null) {
  if (token) {
    localStorage.setItem('macroflow_refresh_token', token);
  } else {
    localStorage.removeItem('macroflow_refresh_token');
  }
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('macroflow_refresh_token');
}

export function clearTokens() {
  accessToken = null;
  localStorage.removeItem('macroflow_access_token');
  localStorage.removeItem('macroflow_refresh_token');
}

// ============================================================================
// API Client
// ============================================================================

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      setAccessToken(data.accessToken);
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
      }
      return data.accessToken;
    } catch {
      clearTokens();
      return null;
    }
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    const token = getAccessToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include', // Include cookies for refresh token
    });

    // Handle 401 - try to refresh token
    if (response.status === 401 && token) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        const newToken = await this.refreshAccessToken();
        this.isRefreshing = false;

        if (newToken) {
          this.onTokenRefreshed(newToken);
          // Retry original request with new token
          (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, {
            ...fetchOptions,
            headers,
            credentials: 'include',
          });

          if (!retryResponse.ok) {
            throw await this.handleError(retryResponse);
          }

          return retryResponse.json();
        } else {
          // Refresh failed - redirect to login
          window.location.href = '/login';
          throw new Error('Session expired');
        }
      } else {
        // Wait for token refresh
        return new Promise((resolve, reject) => {
          this.subscribeTokenRefresh(async (newToken) => {
            try {
              (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
              const retryResponse = await fetch(url, {
                ...fetchOptions,
                headers,
                credentials: 'include',
              });

              if (!retryResponse.ok) {
                reject(await this.handleError(retryResponse));
                return;
              }

              resolve(retryResponse.json());
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    }

    if (!response.ok) {
      throw await this.handleError(response);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private async handleError(response: Response): Promise<ApiError> {
    let message = 'An unexpected error occurred';
    let errors: Record<string, string[]> | undefined;

    try {
      const data = await response.json();
      message = data.message || data.error || message;
      errors = data.errors;
    } catch {
      message = response.statusText;
    }

    return {
      status: response.status,
      message,
      errors,
    };
  }

  // Convenience methods
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);
export default api;
