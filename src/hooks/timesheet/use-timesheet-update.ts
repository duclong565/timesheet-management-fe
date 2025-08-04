import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import { Timesheet, ApiResponse } from '@/types';
import { toast } from 'sonner';

export interface UpdateTimesheetData {
  id: string;
  date?: string;
  working_time?: number;
  type?: string;
  note?: string;
  project_id?: string;
  task_id?: string;
}

export function useTimesheetUpdate() {
  const { authState } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      data: UpdateTimesheetData,
    ): Promise<ApiResponse<Timesheet>> => {
      if (!authState.isAuthenticated || !authState.user) {
        throw new Error('User not authenticated');
      }

      const { id, ...updateData } = data;
      console.log('Updating timesheet:', id, updateData);

      const response = await apiClient.updateTimesheet(id, updateData);
      console.log('Update timesheet response:', response);
      return response;
    },
    onMutate: async (newData) => {
      const { id } = newData;

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['timesheets'] });

      // Snapshot the previous value
      const previousTimesheets = queryClient.getQueryData(['timesheets']);

      // Optimistically update to the new value
      queryClient.setQueriesData({ queryKey: ['timesheets'] }, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          data: old.data.map((timesheet: Timesheet) =>
            timesheet.id === id ? { ...timesheet, ...newData } : timesheet,
          ),
        };
      });

      // Return a context object with the snapshotted value
      return { previousTimesheets };
    },
    onError: (err, newData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTimesheets) {
        queryClient.setQueryData(['timesheets'], context.previousTimesheets);
      }

      const errorMessage = err?.message || 'Failed to update timesheet';
      toast.error(errorMessage);
    },
    onSuccess: (data) => {
      // Invalidate and refetch timesheet queries
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      queryClient.invalidateQueries({ queryKey: ['timesheet-complaints'] });

      toast.success('Timesheet updated successfully!');
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });

  return {
    updateTimesheet: mutation.mutate,
    updateTimesheetAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// Hook with validation wrapper (similar to create)
export function useTimesheetUpdateWithValidation() {
  const { updateTimesheet, isUpdating, error, reset } = useTimesheetUpdate();

  const updateTimesheetWithValidation = (data: UpdateTimesheetData) => {
    // Basic validation
    if (!data.id) {
      toast.error('Timesheet ID is required for update');
      return;
    }

    // Validate working time if provided
    if (data.working_time !== undefined) {
      if (data.working_time < 0.1) {
        toast.error('Working time must be at least 0.1 hours');
        return;
      }
      if (data.working_time > 24) {
        toast.error('Working time cannot exceed 24 hours per day');
        return;
      }
      if (data.working_time % 0.5 !== 0) {
        toast.error('Working time must be in 30-minute increments');
        return;
      }
    }

    // Validate date if provided
    if (data.date) {
      const selectedDate = new Date(data.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (selectedDate > today) {
        toast.error('Cannot update timesheet for future dates');
        return;
      }

      if (isNaN(selectedDate.getTime())) {
        toast.error('Invalid date format');
        return;
      }
    }

    updateTimesheet(data);
  };

  return {
    updateTimesheetWithValidation,
    isUpdating,
    error,
    reset,
  };
}
