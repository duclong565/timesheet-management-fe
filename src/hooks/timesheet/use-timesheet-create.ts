import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import { CreateTimesheetDto, Timesheet, ApiResponse } from '@/types';
import { toast } from 'sonner';

export function useTimesheetCreate() {
  const { authState } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      timesheetData: CreateTimesheetDto,
    ): Promise<ApiResponse<Timesheet>> => {
      if (!authState.isAuthenticated || !authState.user) {
        throw new Error('User not authenticated');
      }

      console.log('Creating timesheet:', timesheetData);

      const response = await apiClient.createTimesheet(timesheetData);
      console.log('Create timesheet response:', response);

      return response;
    },
    onMutate: async (newTimesheetData: CreateTimesheetDto) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['timesheets'] });

      // Snapshot the previous value
      const previousTimesheets = queryClient.getQueriesData({
        queryKey: ['timesheets'],
      });

      // Optimistically update to the new value
      queryClient.setQueriesData<any>({ queryKey: ['timesheets'] }, (old) => {
        if (!old) return old;

        // Create optimistic timesheet
        const optimisticTimesheet: Timesheet = {
          id: `temp-${Date.now()}`, // Temporary ID
          user: authState.user!,
          date: newTimesheetData.date,
          working_time: newTimesheetData.workingTime,
          type: newTimesheetData.type,
          note: newTimesheetData.note,
          status: 'PENDING',
          check_in_late: 0,
          check_out_early: 0,
          money: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          project: undefined, // Will be populated by backend
          task: undefined, // Will be populated by backend
        };

        return {
          ...old,
          data: [optimisticTimesheet, ...old.data],
          pagination: {
            ...old.pagination,
            total: old.pagination.total + 1,
          },
        };
      });

      // Return a context object with the snapshotted value
      return { previousTimesheets };
    },
    onError: (error, newTimesheetData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTimesheets) {
        context.previousTimesheets.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Show error toast
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create timesheet';
      toast.error(errorMessage);

      console.error('Create timesheet error:', error);
    },
    onSuccess: (data, variables) => {
      // Update cache with real data from server
      queryClient.setQueriesData<any>({ queryKey: ['timesheets'] }, (old) => {
        if (!old) return old;

        // Remove optimistic entry and add real one
        const filteredData = old.data.filter(
          (item: Timesheet) => !item.id.startsWith('temp-'),
        );

        return {
          ...old,
          data: [data.data, ...filteredData],
        };
      });

      // Show success toast
      toast.success(data.message || 'Timesheet created successfully');

      console.log('Timesheet created successfully:', data);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is in sync
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });

  return {
    createTimesheet: mutation.mutate,
    createTimesheetAsync: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

// Helper hook for creating timesheet with validation
export function useTimesheetCreateWithValidation() {
  const createMutation = useTimesheetCreate();

  const createTimesheetWithValidation = async (data: CreateTimesheetDto) => {
    // Basic client-side validation
    const errors: string[] = [];

    if (!data.date) {
      errors.push('Date is required');
    }

    if (!data.workingTime || data.workingTime <= 0) {
      errors.push('Working time must be greater than 0');
    }

    if (data.workingTime > 24) {
      errors.push('Working time cannot exceed 24 hours per day');
    }

    if (!['NORMAL', 'OVERTIME', 'HOLIDAY'].includes(data.type)) {
      errors.push('Invalid timesheet type');
    }

    // Check if date is in the future (optional business rule)
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (selectedDate > today) {
      errors.push('Cannot create timesheet for future dates');
    }

    if (errors.length > 0) {
      toast.error(errors[0]); // Show first error
      throw new Error(errors.join(', '));
    }

    return createMutation.createTimesheetAsync(data);
  };

  return {
    ...createMutation,
    createTimesheetWithValidation,
  };
}
