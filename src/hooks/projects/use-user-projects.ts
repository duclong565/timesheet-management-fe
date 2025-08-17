import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import { Project } from '@/types';

export function useUserProjects(enabled: boolean = true) {
  const { authState } = useAuth();
  const isAuthenticated = authState.isAuthenticated && authState.user;

  const { data, isLoading, error, refetch, isFetching, isError } = useQuery({
    queryKey: ['user-projects', authState.user?.id],
    queryFn: async (): Promise<Project[]> => {
      if (!isAuthenticated || !authState.user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching user projects for user:', authState.user.id);

      const response = await apiClient.getUserProjects(authState.user.id);
      console.log('User projects API Response:', response);

      // Ensure we have a valid response structure
      if (!response || typeof response !== 'object') {
        console.warn('Invalid response structure:', response);
        return [];
      }

      // Handle different possible response structures
      let projects: Project[] = [];

      if (response.data && Array.isArray(response.data)) {
        // Standard ApiResponse structure: { data: Project[], ... }
        projects = response.data;
      } else if (Array.isArray(response)) {
        // Direct array response
        projects = response;
      } else if (Array.isArray(response.data?.data)) {
        // Nested data structure: { data: { data: Project[] } }
        projects = response.data.data;
      } else if (Array.isArray((response as { projects?: Project[] }).projects)) {
        // Alternate structure: { projects: Project[] }
        projects = (response as { projects: Project[] }).projects;
      } else {
        console.warn('Unexpected response structure, returning empty array:', response);
        return [];
      }

      console.log('Processed projects:', projects);
      return projects;
    },
    enabled: enabled && !!isAuthenticated && !!authState.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes - projects don't change frequently
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

  // Ensure we always return an array
  const projects = Array.isArray(data) ? data : [];

  return {
    projects,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    isAuthenticated,
  };
}

// Helper hook for getting active projects only
export function useActiveUserProjects() {
  const { projects, ...rest } = useUserProjects();

  // Ensure projects is an array before filtering
  const activeProjects = Array.isArray(projects)
    ? projects.filter(
        (project) =>
          project.status === 'ACTIVE' || project.status === undefined,
      )
    : [];

  return {
    projects: activeProjects,
    ...rest,
  };
}
