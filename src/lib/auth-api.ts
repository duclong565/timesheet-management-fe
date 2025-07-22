import {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  ApiResponse,
  User,
} from '@/types/auth';
import { env } from './env';
import { ApiTransformer } from './api-transformer';

class AuthAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = env.API_BASE_URL;
  }

  // Helper method for API calls with retry mechanism
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      return await ApiTransformer.transformResponse<T>(response);
    } catch (error) {
      // Retry logic for retryable errors
      if (retryCount < 3 && ApiTransformer.isRetryableError(error)) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      throw error;
    }
  }

  // ====================================
  // AUTHENTICATION ENDPOINTS
  // ====================================

  /**
   * Login with username/email and password
   * POST /auth/login
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<ApiResponse<AuthResponse>>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
    );

    return ApiTransformer.transformAuthResponse(response);
  }

  /**
   * Register new user account
   * POST /auth/register
   */
  async register(userData: SignupRequest): Promise<AuthResponse> {
    const response = await this.request<ApiResponse<AuthResponse>>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      },
    );

    return ApiTransformer.transformAuthResponse(response);
  }

  /**
   * Get current user profile
   * GET /auth/profile
   */
  async getProfile(token: string): Promise<User> {
    return this.request<User>('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Initiate Google OAuth authentication
   * GET /auth/google
   */
  getGoogleAuthUrl(): string {
    return env.GOOGLE_AUTH_URL;
  }

  /**
   * Handle Google OAuth callback
   * This is handled by the backend, but we can check the response
   */
  async handleGoogleCallback(
    code: string,
    state?: string,
  ): Promise<AuthResponse> {
    // This endpoint is typically handled by redirect, but we can implement polling
    // or WebSocket communication for SPA handling if needed
    const params = new URLSearchParams();
    params.append('code', code);
    if (state) params.append('state', state);

    return this.request<AuthResponse>(`/auth/google/callback?${params}`, {
      method: 'GET',
    });
  }

  /**
   * Forgot password functionality
   * Note: This endpoint might not exist in your backend yet
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await this.request<ApiResponse<{ message: string }>>(
      '/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to send reset email');
    }

    return response.data;
  }

  /**
   * Reset password functionality
   * Note: This endpoint might not exist in your backend yet
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const response = await this.request<ApiResponse<{ message: string }>>(
      '/auth/reset-password',
      {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to reset password');
    }

    return response.data;
  }

  // ====================================
  // TOKEN MANAGEMENT
  // ====================================

  /**
   * Store token in localStorage
   */
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * Remove token from localStorage
   */
  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Export singleton instance
export const authAPI = new AuthAPI();
export default authAPI;
