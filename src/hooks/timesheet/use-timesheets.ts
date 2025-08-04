import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import { TimesheetQuery, PaginatedResponse, Timesheet } from '@/types';
import {
  getStartOfDay,
  getEndOfDay,
  formatApiDateTime,
} from '@/lib/date-utils';

export interface UseTimesheetsOptions {
  query?: TimesheetQuery;
  enabled?: boolean;
}

export function useTimesheets(options?: UseTimesheetsOptions) {
  const { authState } = useAuth();
  const queryClient = useQueryClient();
  const isAuthenticated = authState.isAuthenticated && authState.user;

  const queryKey = useMemo(
    () => ['timesheets', options?.query, authState.user?.id],
    [options?.query, authState.user?.id],
  );

  const { data, isLoading, error, refetch, isFetching, isError } = useQuery({
    queryKey,
    queryFn: async (): Promise<PaginatedResponse<Timesheet>> => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching timesheets with query:', options?.query);

      const response = await apiClient.getTimesheets(options?.query);
      console.log('Timesheets API Response:', response);

      return response;
    },
    enabled: options?.enabled !== false && !!isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds - timesheets change frequently
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

  // Helper functions for cache management
  const invalidateTimesheets = () => {
    queryClient.invalidateQueries({ queryKey: ['timesheets'] });
  };

  const updateTimesheetInCache = (updatedTimesheet: Timesheet) => {
    queryClient.setQueryData<PaginatedResponse<Timesheet>>(
      queryKey,
      (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          data: oldData.data.map((timesheet) =>
            timesheet.id === updatedTimesheet.id ? updatedTimesheet : timesheet,
          ),
        };
      },
    );
  };

  const removeTimesheetFromCache = (timesheetId: string) => {
    queryClient.setQueryData<PaginatedResponse<Timesheet>>(
      queryKey,
      (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          data: oldData.data.filter(
            (timesheet) => timesheet.id !== timesheetId,
          ),
          pagination: {
            ...oldData.pagination,
            total: oldData.pagination.total - 1,
          },
        };
      },
    );
  };

  const addTimesheetToCache = (newTimesheet: Timesheet) => {
    queryClient.setQueryData<PaginatedResponse<Timesheet>>(
      queryKey,
      (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          data: [newTimesheet, ...oldData.data],
          pagination: {
            ...oldData.pagination,
            total: oldData.pagination.total + 1,
          },
        };
      },
    );
  };

  return {
    // Data
    timesheets: data?.data || [],
    pagination: data?.pagination,

    // States
    isLoading,
    isFetching,
    isError,
    error,
    isAuthenticated,

    // Actions
    refetch,
    invalidateTimesheets,
    updateTimesheetInCache,
    removeTimesheetFromCache,
    addTimesheetToCache,
  };
}

// Helper hook for getting timesheets for a specific date range
export function useTimesheetsForDateRange(
  startDate: Date,
  endDate: Date,
  enabled: boolean = true,
) {
  // Create proper start and end of day DateTime strings for Prisma
  const startDateTime = getStartOfDay(startDate);
  const endDateTime = getEndOfDay(endDate);

  return useTimesheets({
    query: {
      start_date: formatApiDateTime(startDateTime),
      end_date: formatApiDateTime(endDateTime),
      limit: 200, // Increased limit for monthly views (31 days * potential multiple entries per day)
    },
    enabled,
  });
}

// Helper hook for getting timesheets for current week
export function useCurrentWeekTimesheets(currentDate: Date = new Date()) {
  const startOfWeek = useMemo(() => {
    const date = new Date(currentDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    return new Date(date.setDate(diff));
  }, [currentDate]);

  const endOfWeek = useMemo(() => {
    const date = new Date(startOfWeek);
    return new Date(date.setDate(date.getDate() + 6));
  }, [startOfWeek]);

  return useTimesheetsForDateRange(startOfWeek, endOfWeek);
}

// Helper hook for getting timesheets for current month
export function useCurrentMonthTimesheets(currentDate: Date = new Date()) {
  const startOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }, [currentDate]);

  const endOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  }, [currentDate]);

  console.log('📅 Monthly timesheet range:', {
    currentDate: currentDate.toISOString().split('T')[0],
    startOfMonth: startOfMonth.toISOString().split('T')[0],
    endOfMonth: endOfMonth.toISOString().split('T')[0],
  });

  return useTimesheetsForDateRange(startOfMonth, endOfMonth);
}
