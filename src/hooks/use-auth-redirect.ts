'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login'];

// Routes that should redirect authenticated users
const AUTH_ROUTES = ['/login'];

export function useAuthRedirect() {
  const { authState } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth to finish loading
    if (authState.isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    if (!authState.isAuthenticated && !isPublicRoute) {
      // Redirect to login if not authenticated and not on public route
      router.push('/login');
    } else if (authState.isAuthenticated && isAuthRoute) {
      // Redirect to dashboard if authenticated and on auth route
      router.push('/');
    }
  }, [authState.isAuthenticated, authState.isLoading, pathname, router]);

  return {
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    shouldShowContent:
      !authState.isLoading &&
      (authState.isAuthenticated || PUBLIC_ROUTES.includes(pathname)),
  };
}

// Hook specifically for protecting routes
export function useProtectedRoute() {
  const { authState } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
      if (!isPublicRoute) {
        router.push('/login');
      }
    }
  }, [authState.isAuthenticated, authState.isLoading, pathname, router]);

  return {
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    user: authState.user,
  };
}
