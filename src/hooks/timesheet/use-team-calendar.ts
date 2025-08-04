import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface TeamCalendarDay {
  day: number;
  weekday: string;
  isWeekend: boolean;
}

export interface TeamCalendarUser {
  user: {
    id: string;
    name: string;
    position: string;
  };
  days: Array<{
    type: string;
    absence_type: string | null;
    project: {
      id: string;
      name: string;
    } | null;
    requestId: string;
    period: 'FULL_DAY' | 'MORNING' | 'AFTERNOON';
  } | null>;
}

export interface TeamCalendarData {
  month: number;
  year: number;
  days: TeamCalendarDay[];
  users: TeamCalendarUser[];
}

interface UseTeamCalendarParams {
  month: number;
  year: number;
  projectId?: string;
  branchId?: string;
}

export function useTeamCalendar(params: UseTeamCalendarParams) {
  const query = useQuery({
    queryKey: ['team-calendar', params],
    queryFn: async (): Promise<TeamCalendarData> => {
      const response = await apiClient.getTeamCalendar(params);
      return response.data as TeamCalendarData;
    },
    enabled: !!(params.month && params.year),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    calendarData: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
