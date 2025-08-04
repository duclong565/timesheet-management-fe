import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import { WeekSubmission, SubmitWeekDto, ApiResponse } from '@/types';
import { toast } from 'sonner';

export interface UseSubmitWeekButtonOptions {
  weekStartDate: string; // Monday date in YYYY-MM-DD format
  enabled?: boolean;
}

export function useSubmitWeekButton(options: UseSubmitWeekButtonOptions) {
  const { authState } = useAuth();
  const queryClient = useQueryClient();
  const isAuthenticated = authState.isAuthenticated && authState.user;

  // Helper: extract user id from various possible shapes (plain or wrapped)
  const getUserIdFromAuth = () => {
    if (!authState.user) return null;

    // Plain shape: { id: 'uuid', ... }
    if (
      typeof authState.user === 'object' &&
      'id' in authState.user &&
      typeof (authState.user as any).id === 'string'
    ) {
      return (authState.user as any).id as string;
    }

    // Wrapped shape: { data: { id: 'uuid', ... }, success: true, ... }
    if (
      typeof authState.user === 'object' &&
      'data' in authState.user &&
      authState.user?.data &&
      typeof (authState.user as any).data.id === 'string'
    ) {
      return (authState.user as any).data.id as string;
    }

    // Fallback legacy keys
    return (
      (authState.user as any).user_id || (authState.user as any).userId || null
    );
  };

  // Authentication ready state
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const userId = getUserIdFromAuth();

    if (
      !isAuthenticated ||
      !authState.user ||
      !userId ||
      !apiClient.getToken()
    ) {
      setAuthReady(false);
      return;
    }

    const timer = setTimeout(() => {
      setAuthReady(true);
    }, 150); // Slightly longer delay to ensure auth is stable

    return () => clearTimeout(timer);
  }, [isAuthenticated, authState.user]);

  // Debug authentication state
  console.log('🔐 Auth Debug:', {
    isAuthenticated,
    hasUser: !!authState.user,
    userObject: authState.user, // Check full user object structure
    extractedUserId: getUserIdFromAuth(),
    hasToken: !!apiClient.getToken(),
    authReady,
    weekStartDate: options.weekStartDate,
    queryEnabled:
      authReady && !!options.weekStartDate && options.enabled !== false,
  });

  // Query to check if the current week is already submitted
  const weekStatusQuery = useQuery({
    queryKey: [
      'week-submission-status',
      options.weekStartDate,
      getUserIdFromAuth(),
    ],
    queryFn: async (): Promise<{
      isSubmitted: boolean;
      status?: string;
      submissionData?: WeekSubmission;
    }> => {
      const userId = getUserIdFromAuth();
      if (!userId) {
        throw new Error('User not authenticated - no user ID found');
      }

      console.log(
        '🔍 Checking week submission status for:',
        options.weekStartDate,
      );

      try {
        // Method 1: Check via the isWeekSubmitted endpoint
        const statusResponse = await apiClient.isWeekSubmitted(
          options.weekStartDate,
        );
        console.log('📊 Week status response:', statusResponse);

        if (statusResponse?.data?.isSubmitted) {
          console.log('✅ Week is submitted via status check');
          return {
            isSubmitted: true,
            status: 'SUBMITTED',
          };
        }

        // Method 2: Fallback - check user's submission history
        const submissionsResponse = await apiClient.getWeekSubmissions();
        console.log('📋 User submissions RAW:', submissionsResponse);
        console.log('📋 User submissions DATA:', submissionsResponse?.data);

        const submissions = submissionsResponse?.data || [];
        console.log('📋 All submissions:', submissions);
        console.log('🎯 Looking for week starting:', options.weekStartDate);

        const currentWeekSubmission = submissions.find((submission) => {
          const submissionStartDate = submission.week_start_date.split('T')[0];
          console.log('🔍 Comparing:', {
            submissionStartDate,
            targetDate: options.weekStartDate,
            match: submissionStartDate === options.weekStartDate,
          });
          return submissionStartDate === options.weekStartDate;
        });

        if (currentWeekSubmission) {
          console.log(
            '✅ Found week submission in history:',
            currentWeekSubmission,
          );
          return {
            isSubmitted: true,
            status: currentWeekSubmission.status,
            submissionData: currentWeekSubmission,
          };
        }

        console.log('❌ Week not submitted');
        return { isSubmitted: false };
      } catch (error) {
        console.error('🚨 Error checking week status:', error);

        // Show user-friendly error message
        const errorMessage = (error as any)?.message || 'Unknown error';
        if (errorMessage.includes('week-submissions not found')) {
          console.warn('⚠️ Route collision detected - this should be fixed in backend');
        } else if (!errorMessage.includes('Network error')) {
          // Only show toast for non-network errors to avoid spam
          toast.error('Failed to check week submission status');
        }

        // If there's an error, fallback to checking submissions only
        try {
          const submissionsResponse = await apiClient.getWeekSubmissions();
          const submissions = submissionsResponse?.data || [];
          console.log('🔄 Fallback check - All submissions:', submissions);
          console.log(
            '🔄 Fallback check - Looking for week starting:',
            options.weekStartDate,
          );

          const currentWeekSubmission = submissions.find((submission) => {
            const submissionStartDate =
              submission.week_start_date.split('T')[0];
            console.log('🔄 Fallback comparing:', {
              submissionStartDate,
              targetDate: options.weekStartDate,
              match: submissionStartDate === options.weekStartDate,
            });
            return submissionStartDate === options.weekStartDate;
          });

          if (currentWeekSubmission) {
            console.log(
              '✅ Found week submission via fallback:',
              currentWeekSubmission,
            );
            return {
              isSubmitted: true,
              status: currentWeekSubmission.status,
              submissionData: currentWeekSubmission,
            };
          }
        } catch (fallbackError) {
          console.error('🚨 Fallback check also failed:', fallbackError);
          // Don't show another toast here, as the main error already showed one
        }

        // If both methods fail, assume not submitted to avoid blocking user
        return { isSubmitted: false };
      }
    },
    enabled: authReady && !!options.weekStartDate && options.enabled !== false,
    staleTime: 30 * 1000, // 30 seconds
    retry: (failureCount, error) => {
      console.log('🔄 Retry attempt:', { failureCount, error });
      if (failureCount >= 2) return false; // Max 2 retries

      // Don't retry auth errors
      const errorMessage = error?.message || '';
      if (
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('authentication')
      ) {
        return false;
      }
      return true;
    },
  });

  // Mutation to submit week for approval
  const submitMutation = useMutation({
    mutationFn: async (): Promise<ApiResponse<WeekSubmission>> => {
      const userId = getUserIdFromAuth();
      if (!userId) {
        throw new Error('User not authenticated - no user ID found');
      }

      console.log('📤 Submitting week for approval:', options.weekStartDate);

      const submitData: SubmitWeekDto = {
        week_start_date: options.weekStartDate,
      };

      const response = await apiClient.submitWeekForApproval(submitData);
      console.log('✅ Submit week response:', response);

      return response;
    },
    onMutate: async () => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: ['week-submission-status', options.weekStartDate],
      });

      // Optimistically update status
      const userId = getUserIdFromAuth();
      const previousData = queryClient.getQueryData([
        'week-submission-status',
        options.weekStartDate,
        userId,
      ]);

      queryClient.setQueryData(
        ['week-submission-status', options.weekStartDate, userId],
        { isSubmitted: true, status: 'SUBMITTED' },
      );

      return { previousData };
    },
    onError: (error, _, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        const userId = getUserIdFromAuth();
        queryClient.setQueryData(
          ['week-submission-status', options.weekStartDate, userId],
          context.previousData,
        );
      }

      console.error('🚨 Submit week error:', error);

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
      } else {
        toast.error(
          `Failed to submit week: ${errorMessage || 'Unknown error'}`,
        );
      }
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['week-submission-status'] });
      queryClient.invalidateQueries({ queryKey: ['week-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });

      toast.success('Week submitted for approval successfully!');
      console.log('✅ Week submission successful:', data);
    },
  });

  // Derived state for button
  const weekStatus = weekStatusQuery.data;
  const isSubmitted = weekStatus?.isSubmitted || false;
  const submissionStatus = weekStatus?.status;
  const isLoading = weekStatusQuery.isLoading || submitMutation.isPending;
  const isSubmitting = submitMutation.isPending;

  // Button text logic
  const getButtonText = () => {
    if (isSubmitting) {
      return 'Submitting...';
    }

    if (isSubmitted) {
      switch (submissionStatus) {
        case 'APPROVED':
          return 'Week Approved';
        case 'REJECTED':
          return 'Week Rejected';
        case 'SUBMITTED':
        default:
          return 'Week Already Submitted';
      }
    }

    return 'Submit Week for Approval';
  };

  // Button disabled logic
  const isButtonDisabled = isSubmitted || isSubmitting || !authReady;

  return {
    // Button states
    isSubmitted,
    submissionStatus,
    buttonText: getButtonText(),
    isButtonDisabled,

    // Loading states
    isLoading,
    isSubmitting,
    isCheckingStatus: weekStatusQuery.isLoading,

    // Actions
    submitWeek: () => submitMutation.mutate(),
    submitWeekAsync: () => submitMutation.mutateAsync(),

    // Data
    submissionData: weekStatus?.submissionData,

    // Utilities
    refetchStatus: weekStatusQuery.refetch,
    reset: submitMutation.reset,

    // Errors
    error: weekStatusQuery.error || submitMutation.error,
    submitError: submitMutation.error,
    statusError: weekStatusQuery.error,
  };
}
