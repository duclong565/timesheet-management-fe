import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import { WeekSubmission, SubmitWeekDto, ApiResponse } from '@/types';
import { toast } from 'sonner';

export interface UseWeekSubmissionOptions {
  weekStartDate?: string; // Monday date in YYYY-MM-DD format
  enabled?: boolean;
}

export function useWeekSubmission(options?: UseWeekSubmissionOptions) {
  const { authState } = useAuth();
  const queryClient = useQueryClient();
  const isAuthenticated = authState.isAuthenticated && authState.user;

  // Add a small delay to ensure authentication is fully established
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !authState.user?.id || !apiClient.getToken()) {
      setAuthReady(false);
      return;
    }

    const timer = setTimeout(() => {
      setAuthReady(true);
    }, 100); // Small delay to ensure auth is ready

    return () => clearTimeout(timer);
  }, [isAuthenticated, authState.user?.id]);

  // Query to check if specific week is submitted
  const weekSubmissionQueryKey = useMemo(
    () => ['week-submitted', options?.weekStartDate, authState.user?.id],
    [options?.weekStartDate, authState.user?.id],
  );

  const {
    data: weekSubmissionStatus,
    isLoading: isCheckingStatus,
    error: statusError,
    refetch: checkSubmissionStatus,
  } = useQuery({
    queryKey: weekSubmissionQueryKey,
    queryFn: async (): Promise<ApiResponse<{ isSubmitted: boolean }>> => {
      if (!isAuthenticated || !options?.weekStartDate) {
        throw new Error(
          'User not authenticated or week start date not provided',
        );
      }

      console.log(
        'Checking week submission status for:',
        options.weekStartDate,
      );
      console.log('User authentication state:', {
        isAuthenticated,
        hasUser: !!authState.user,
        userId: authState.user?.id,
        hasToken: !!apiClient.getToken(),
      });

      const response = await apiClient.isWeekSubmitted(options.weekStartDate);
      console.log('Week submission status response:', response);

      return response;
    },
    enabled:
      options?.enabled !== false && authReady && !!options?.weekStartDate,
    staleTime: 30 * 1000, // 30 seconds
    retry: (failureCount, error) => {
      console.log('Query retry attempt:', { failureCount, error });
      // Don't retry if it's an auth error
      if (
        error?.message?.includes('401') ||
        error?.message?.includes('authentication') ||
        error?.message?.includes('Unauthorized')
      ) {
        console.log('Authentication error detected, not retrying');
        return false;
      }
      return failureCount < 3;
    },
  });

  // Query to get user's week submissions history
  const submissionsQueryKey = useMemo(
    () => ['week-submissions', authState.user?.id],
    [authState.user?.id],
  );

  const {
    data: submissionsData,
    isLoading: isLoadingSubmissions,
    error: submissionsError,
    refetch: refetchSubmissions,
  } = useQuery({
    queryKey: submissionsQueryKey,
    queryFn: async (): Promise<ApiResponse<WeekSubmission[]>> => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching user week submissions');

      const response = await apiClient.getWeekSubmissions();
      console.log('Week submissions response:', response);

      return response;
    },
    enabled: options?.enabled !== false && authReady,
    staleTime: 60 * 1000, // 1 minute - submissions don't change often
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

  // Mutation to submit week for approval
  const submitWeekMutation = useMutation({
    mutationFn: async (
      submitData: SubmitWeekDto,
    ): Promise<ApiResponse<WeekSubmission>> => {
      if (!authState.isAuthenticated || !authState.user) {
        throw new Error('User not authenticated');
      }

      console.log('Submitting week for approval:', submitData);

      const response = await apiClient.submitWeekForApproval(submitData);
      console.log('Submit week response:', response);

      return response;
    },
    onMutate: async (submitData: SubmitWeekDto) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['week-submitted', submitData.week_start_date],
      });
      await queryClient.cancelQueries({ queryKey: ['week-submissions'] });
      await queryClient.cancelQueries({ queryKey: ['timesheets'] });

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData(weekSubmissionQueryKey);
      const previousSubmissions = queryClient.getQueryData(submissionsQueryKey);

      // Optimistically update week submission status
      queryClient.setQueryData(weekSubmissionQueryKey, {
        data: { isSubmitted: true },
        message: 'Week submitted for approval',
      });

      // Return context for rollback
      return { previousStatus, previousSubmissions };
    },
    onError: (error, _, context) => {
      // Rollback optimistic updates
      if (context?.previousStatus) {
        queryClient.setQueryData(
          weekSubmissionQueryKey,
          context.previousStatus,
        );
      }
      if (context?.previousSubmissions) {
        queryClient.setQueryData(
          submissionsQueryKey,
          context.previousSubmissions,
        );
      }

      console.error('Submit week error:', error);

      // Handle specific error messages with better error object parsing
      const errorMessage = error?.message || '';
      const errorData = (error as { data?: { message?: string } })?.data || {};

      if (
        errorMessage.includes('already submitted') ||
        errorData?.message?.includes('already submitted')
      ) {
        toast.error('This week has already been submitted for approval.');
      } else if (
        errorMessage.includes('overlapping weeks') ||
        errorData?.message?.includes('overlapping weeks')
      ) {
        toast.error(
          'Cannot submit overlapping weeks that are already submitted.',
        );
      } else if (
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('authentication')
      ) {
        toast.error('Your session has expired. Please log in again.');
      } else if (
        errorMessage.trim() === '' ||
        errorMessage === 'API Error: {}'
      ) {
        // Handle empty error messages gracefully
        toast.error(
          'Network error occurred. Please check your connection and try again.',
        );
      } else {
        toast.error(
          `Failed to submit week: ${errorMessage || 'Unknown error'}`,
        );
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['week-submitted'] });
      queryClient.invalidateQueries({ queryKey: ['week-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });

      toast.success('Week submitted for approval successfully!');
      console.log('Week submission successful:', data);
    },
  });

  // Derived state
  const isSubmitted =
    (weekSubmissionStatus?.data as { isSubmitted: boolean } | undefined)
      ?.isSubmitted || false;
  const submissions = submissionsData?.data || [];
  const isLoading =
    isCheckingStatus || isLoadingSubmissions || submitWeekMutation.isPending;
  const error = statusError || submissionsError || submitWeekMutation.error;

  return {
    // Week submission status
    isSubmitted,
    checkSubmissionStatus,

    // User's submissions history
    submissions,
    refetchSubmissions,

    // Submit week mutation
    submitWeek: submitWeekMutation.mutate,
    submitWeekAsync: submitWeekMutation.mutateAsync,
    isSubmitting: submitWeekMutation.isPending,
    submitError: submitWeekMutation.error,

    // Loading states
    isLoading,
    isCheckingStatus,
    isLoadingSubmissions,

    // Errors
    error,
    statusError,
    submissionsError,

    // Utilities
    reset: () => {
      submitWeekMutation.reset();
    },
  };
}
