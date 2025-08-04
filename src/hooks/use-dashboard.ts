import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import { DashboardData } from '@/types/dashboard';

export interface UseDashboardOptions {
  query?: Record<string, unknown>;
  enabled?: boolean;
}

export function useDashboard(options?: UseDashboardOptions) {
  const { authState } = useAuth();
  const isAuthenticated = authState.isAuthenticated && authState.user;

  const queryKey = useMemo(
    () => ['dashboard', options?.query, authState.user?.id],
    [options?.query, authState.user?.id],
  );

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }
      const response = await apiClient.getDashboard(options?.query);

      return response.data as DashboardData;
    },
    enabled: options?.enabled !== false && !!isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
    retry: (failureCount, error) => {
      // Don't retry if it's an auth error
      if (
        error?.message?.includes('401') ||
        error?.message?.includes('authentication')
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
    isAuthenticated,
  };
}
