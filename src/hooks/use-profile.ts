import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { User } from '@/types';

export function useProfile() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      // Use the users/me endpoint for full profile
      const response = await apiClient.get<{ data: User }>('/users/me');
      return response.data; // Extract only the user object
    },
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  };
}
