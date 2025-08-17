import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  TeamCalendarData,
  TeamCalendarQuery,
} from '@/types/team-calendar';

export function useTeamCalendar(params: TeamCalendarQuery) {
  const query = useQuery({
    queryKey: ['team-calendar', params],
    queryFn: async (): Promise<TeamCalendarData> => {
      const response = await apiClient.getTeamCalendar(params);
      return response.data;
    },
    enabled: Boolean(params.month && params.year),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    calendarData: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
