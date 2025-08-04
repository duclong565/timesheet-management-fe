'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AuthState,
  AuthContextValue,
  LoginFormData,
  SignupFormData,
  User,
} from '@/types/auth';
import authAPI from '@/lib/auth-api';
import { apiClient } from '@/lib/api-client';
import { LoadingScreen } from '@/components/ui/loading';
import { ApiTransformer, AuthenticationError } from '@/lib/api-transformer';
import { toast } from 'sonner';

// Auth Actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' };

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    default:
      return state;
  }
};

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
  error: null,
};

// Create context
const AuthContext = createContext<AuthContextValue | null>(null);

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authAPI.getToken();

        if (token) {
          // Verify token and get user profile
          const user = await authAPI.getProfile(token);
          // Sync token with main API client
          apiClient.setToken(token);
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        }
      } catch (error) {
        // Token is invalid, clear it
        authAPI.clearToken();
        apiClient.clearToken();

        // Show toast notification for authentication errors
        if (error instanceof AuthenticationError) {
          toast.error('Your session has expired. Please log in again.');
        } else {
          console.error('Auth initialization error:', error);
        }
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (formData: LoginFormData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await authAPI.login({
        username: formData.username,
        password: formData.password,
      });

      const { user, token } = response;
      authAPI.setToken(token);
      // Sync token with main API client
      apiClient.setToken(token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });

      // Redirect to dashboard
      router.push('/');
    } catch (error: unknown) {
      const errorMessage = ApiTransformer.transformErrorForUser(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  // Signup function
  const signup = async (formData: SignupFormData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        name: formData.name,
        surname: formData.surname,
      });

      const { user, token } = response;
      authAPI.setToken(token);
      // Sync token with main API client
      apiClient.setToken(token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });

      // Redirect to dashboard
      router.push('/');
    } catch (error: unknown) {
      const errorMessage = ApiTransformer.transformErrorForUser(error);
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
    }
  };

  // Logout function
  const logout = () => {
    authAPI.clearToken();
    // Clear token from main API client too
    apiClient.clearToken();
    dispatch({ type: 'LOGOUT' });
    router.push('/login');
  };

  // Google Auth function
  const googleAuth = () => {
    window.location.href = authAPI.getGoogleAuthUrl();
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      await authAPI.forgotPassword(email);
      // Handle success (show success message)
    } catch (error: unknown) {
      const errorMessage = ApiTransformer.transformErrorForUser(error);
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Context value
  const contextValue: AuthContextValue = {
    authState: state,
    login,
    signup,
    logout,
    googleAuth,
    resetPassword,
    clearError,
  };

  // Show loading screen during initial auth check
  if (state.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
