import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import type { PunishmentFilters } from '@/types/punishment';

export interface UsePunishmentsOptions extends PunishmentFilters {
  page?: number;
  limit?: number;
}

export function usePunishments(options: UsePunishmentsOptions) {
  const { year, month, user_id, page = 1, limit = 10 } = options;
  const { authState } = useAuth();
  const isAuthenticated = authState.isAuthenticated && authState.user;

  const query = useQuery({
    queryKey: ['punishments', { year, month, user_id, page, limit }],
    queryFn: async () => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching punishments with filters:', {
        year,
        month,
        user_id,
        page,
        limit,
      });

      const response = await apiClient.getPunishments({
        year,
        month,
        user_id,
        page,
        limit,
        has_punishment: true,
      });

      console.log('Punishments API response:', response);
      return response;
    },
    enabled: !!(year && month && isAuthenticated), // Only fetch when year, month, and auth are provided
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    punishments: query.data?.data || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Hook for getting punishments for current month
export function useCurrentMonthPunishments(userId?: string) {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // getMonth() returns 0-11

  return usePunishments({
    year,
    month,
    user_id: userId,
    page: 1,
    limit: 50, // Show more records for current month
  });
}

// Hook for getting punishment summary/statistics
export function usePunishmentSummary(
  year: number,
  month: number,
  userId?: string,
) {
  const { authState } = useAuth();
  const isAuthenticated = authState.isAuthenticated && authState.user;

  const query = useQuery({
    queryKey: ['punishment-summary', { year, month, userId }],
    queryFn: async () => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching punishment summary for:', { year, month, userId });

      // Get punishments data and calculate summary
      const response = await apiClient.getPunishments({
        year,
        month,
        user_id: userId,
        page: 1,
        limit: 1000, // Get all records for summary
        has_punishment: true,
      });

      const punishments = response.data || [];
      const totalPunished = punishments.length;
      const totalMoney = punishments.reduce(
        (sum: number, p: { money?: number }) => sum + (p.money || 0),
        0,
      );

      const summary = {
        total_punished: totalPunished,
        total_money: totalMoney,
        month,
        year,
      };

      console.log('Punishment summary:', summary);
      return summary;
    },
    enabled: !!(year && month && isAuthenticated),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    summary: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
