import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import type { Role, PaginatedResponse } from '@/types';

export function useRoles() {
  const { authState } = useAuth();
  const isAuthenticated = authState.isAuthenticated && authState.user;

  const query = useQuery({
    queryKey: ['roles'],
    queryFn: async (): Promise<PaginatedResponse<Role>> => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      const response = await apiClient.getRoles();
      return response as PaginatedResponse<Role>;
    },
    enabled: !!isAuthenticated,
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('authentication')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    roles: query.data?.data || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isAuthenticated,
  };
}
