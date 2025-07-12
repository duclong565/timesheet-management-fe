'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginCredentials, UserRole } from '@/types';
import { apiClient, ApiError } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { isClient } from '@/lib/utils';
import { LoadingScreen } from '@/components/ui/loading';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  checkPermission: (allowedRoles: UserRole[]) => boolean;
  hasRole: (role: UserRole) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const isAuthenticated = !!user && !!apiClient.getToken();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize authentication state
  useEffect(() => {
    if (!mounted) return;

    const initializeAuth = async () => {
      try {
        const token = apiClient.getToken();
        if (token) {
          const userData = await apiClient.getProfile();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to get user profile:', error);
        // Token might be expired, clear it
        apiClient.clearToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [mounted]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(credentials);
      setUser(response.data.user);

      if (isClient()) {
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      if (isClient() && error instanceof ApiError) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
      } else if (isClient()) {
        toast({
          title: 'Login failed',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      const response = await apiClient.register(userData);
      setUser(response.data.user);

      if (isClient()) {
        toast({
          title: 'Registration successful',
          description: 'Welcome to Timesheet Management!',
        });
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      if (isClient() && error instanceof ApiError) {
        toast({
          title: 'Registration failed',
          description: error.message,
          variant: 'destructive',
        });
      } else if (isClient()) {
        toast({
          title: 'Registration failed',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      setUser(null);

      if (isClient()) {
        toast({
          title: 'Logged out',
          description: 'You have been successfully logged out',
        });
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state
      setUser(null);
      apiClient.clearToken();

      if (isClient()) {
        router.push('/login');
      }
    }
  };

  const checkPermission = (allowedRoles: UserRole[]): boolean => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role.role_name);
  };

  const hasRole = (role: UserRole): boolean => {
    if (!user || !user.role) return false;
    return user.role.role_name === role;
  };

  const refreshUser = async () => {
    try {
      const userData = await apiClient.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, user might need to login again
      if (error instanceof ApiError && error.isAuthError) {
        await logout();
      }
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    checkPermission,
    hasRole,
    refreshUser,
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <LoadingScreen message="Initializing..." />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Higher-order component for protecting routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: UserRole[],
) => {
  return function ProtectedComponent(props: P) {
    const { user, isLoading, isAuthenticated, checkPermission } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push('/login');
          return;
        }

        if (allowedRoles && !checkPermission(allowedRoles)) {
          router.push('/unauthorized');
          return;
        }
      }
    }, [isLoading, isAuthenticated, user, router, checkPermission]);

    if (isLoading) {
      return <LoadingScreen message="Authenticating..." />;
    }

    if (!isAuthenticated) {
      return null;
    }

    if (allowedRoles && !checkPermission(allowedRoles)) {
      return null;
    }

    return <Component {...props} />;
  };
};

// Hook for checking permissions
export const usePermission = () => {
  const { checkPermission, hasRole } = useAuth();

  return {
    checkPermission,
    hasRole,
    canView: (roles: UserRole[]) => checkPermission(roles),
    canEdit: (roles: UserRole[]) => checkPermission(roles),
    canDelete: (roles: UserRole[]) => checkPermission(roles),
    canApprove: (roles: UserRole[]) => checkPermission(roles),
    isAdmin: () => hasRole('ADMIN'),
    isHR: () => hasRole('HR'),
    isPM: () => hasRole('PM'),
    isUser: () => hasRole('USER'),
  };
};
