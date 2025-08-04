import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import { Task, TaskQuery, PaginatedResponse } from '@/types';

export interface UseTasksOptions {
  query?: TaskQuery;
  enabled?: boolean;
}

export function useTasks(options?: UseTasksOptions) {
  const { authState } = useAuth();
  const isAuthenticated = authState.isAuthenticated && authState.user;

  const { data, isLoading, error, refetch, isFetching, isError } = useQuery({
    queryKey: ['tasks', options?.query],
    queryFn: async (): Promise<PaginatedResponse<Task>> => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching tasks with query:', options?.query);

      const response = await apiClient.getTasks(options?.query);
      console.log('Tasks API Response:', response);

      return response;
    },
    enabled: options?.enabled !== false && !!isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes - tasks change less frequently than timesheets
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
    tasks: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    isAuthenticated,
  };
}

// Hook for getting tasks for a specific project
export function useProjectTasks(
  projectId: string | undefined,
  enabled: boolean = true,
) {
  return useTasks({
    query: projectId ? { project_id: projectId, limit: 100 } : undefined,
    enabled: enabled && !!projectId,
  });
}

// Hook for getting all available tasks for timesheet creation
export function useTimesheetTasks(projectId?: string) {
  const { authState } = useAuth();
  const isAuthenticated = authState.isAuthenticated && authState.user;

  const { data, isLoading, error, refetch, isFetching, isError } = useQuery({
    queryKey: ['timesheet-tasks', projectId],
    queryFn: async (): Promise<Task[]> => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching timesheet tasks for project:', projectId);

      let allTasks: Task[] = [];
      if (projectId) {
        const response = await apiClient.getTasks({
          project_id: projectId,
          limit: 100,
        });
        allTasks = response.data;
      } else {
        const response = await apiClient.getTasks({
          limit: 100,
          sort_by: 'task_name',
          sort_order: 'asc',
        });
        allTasks = response.data;
      }

      console.log('Timesheet tasks response:', allTasks);
      return allTasks;
    },
    enabled: !!isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
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
    tasks: data || [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    isAuthenticated,
  };
}

// Hook for getting standalone tasks (not assigned to any project)
export function useStandaloneTasks() {
  return useTasks({
    query: {
      has_project: false,
      limit: 50,
      sort_by: 'task_name',
      sort_order: 'asc',
    },
  });
}
