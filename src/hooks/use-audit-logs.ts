import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import type { AuditLog, BaseQuery, PaginatedResponse } from '@/types';

type UseAuditLogsOptions = BaseQuery;

export function useAuditLogs(options: UseAuditLogsOptions = {}) {
  const { authState } = useAuth();
  const isAuthenticated = authState.isAuthenticated && authState.user;

  const query = useQuery({
    queryKey: ['audit-logs', options],
    queryFn: async (): Promise<PaginatedResponse<AuditLog>> => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      const response = await apiClient.getAuditLogs(options);
      return response as PaginatedResponse<AuditLog>;
    },
    enabled: !!isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });

  return {
    auditLogs: query.data?.data || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
