import { ApiResponse, AuthResponse } from '@/types/auth';

// API Error Classes for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public field?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, field: string) {
    super(message, 400, 'VALIDATION_ERROR', field);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Network error occurred') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

// Response transformer functions
export class ApiTransformer {
  /**
   * Transform API response and handle errors consistently
   */
  static async transformResponse<T>(response: Response): Promise<T> {
    try {
      // Handle network errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases
        switch (response.status) {
          case 400:
            throw new ValidationError(
              errorData.message || 'Invalid request data',
              errorData.field || 'unknown',
            );
          case 401:
            throw new AuthenticationError(
              errorData.message || 'Authentication required',
            );
          case 403:
            throw new ApiError(
              errorData.message || 'Access forbidden',
              403,
              'FORBIDDEN',
            );
          case 404:
            throw new ApiError(
              errorData.message || 'Resource not found',
              404,
              'NOT_FOUND',
            );
          case 409:
            throw new ApiError(
              errorData.message || 'Conflict occurred',
              409,
              'CONFLICT',
            );
          case 500:
            throw new ApiError(
              errorData.message || 'Internal server error',
              500,
              'SERVER_ERROR',
            );
          default:
            throw new ApiError(
              errorData.message || `HTTP error! status: ${response.status}`,
              response.status,
              'UNKNOWN_ERROR',
            );
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // If it's already our custom error, re-throw
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError('Unable to connect to server');
      }

      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        throw new ApiError('Invalid response format', 500, 'PARSE_ERROR');
      }

      // Fallback for unknown errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500,
        'UNKNOWN_ERROR',
      );
    }
  }

  /**
   * Transform authentication response
   */
  static transformAuthResponse(
    response: ApiResponse<AuthResponse>,
  ): AuthResponse {
    if (!response.success || !response.data) {
      throw new AuthenticationError(
        response.message || 'Authentication failed',
      );
    }

    return {
      user: {
        id: response.data.user.id,
        username: response.data.user.username,
        email: response.data.user.email,
        name: response.data.user.name,
        surname: response.data.user.surname,
        role: response.data.user.role,
        isActive: response.data.user.isActive,
        createdAt: response.data.user.createdAt,
        updatedAt: response.data.user.updatedAt,
      },
      token: response.data.token,
    };
  }

  /**
   * Transform error for user display
   */
  static transformErrorForUser(error: unknown): string {
    if (error instanceof ValidationError) {
      return error.message;
    }

    if (error instanceof AuthenticationError) {
      return error.message;
    }

    if (error instanceof NetworkError) {
      return 'Unable to connect to server. Please check your internet connection.';
    }

    if (error instanceof ApiError) {
      switch (error.code) {
        case 'FORBIDDEN':
          return 'You do not have permission to perform this action.';
        case 'NOT_FOUND':
          return 'The requested resource was not found.';
        case 'CONFLICT':
          return 'This operation conflicts with existing data.';
        case 'SERVER_ERROR':
          return 'Server error occurred. Please try again later.';
        default:
          return error.message;
      }
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error: unknown): boolean {
    if (error instanceof NetworkError) return true;
    if (error instanceof ApiError) {
      return error.statusCode >= 500 || error.statusCode === 0;
    }
    return false;
  }
}

// Type guards for error handling
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isAuthenticationError = (
  error: unknown,
): error is AuthenticationError => {
  return error instanceof AuthenticationError;
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError;
};
