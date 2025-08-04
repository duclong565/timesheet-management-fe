import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import { Timesheet, ApiResponse } from '@/types';
import { toast } from 'sonner';
import { formatDisplayDate, formatWorkingHours } from '@/lib/date-utils';

export function useTimesheetDelete() {
  const { authState } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (timesheetId: string): Promise<ApiResponse<void>> => {
      if (!authState.isAuthenticated || !authState.user) {
        throw new Error('User not authenticated');
      }

      console.log('Deleting timesheet:', timesheetId);

      const response = await apiClient.deleteTimesheet(timesheetId);
      console.log('Delete timesheet response:', response);

      return response;
    },
    onMutate: async (timesheetId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['timesheets'] });

      // Snapshot the previous value
      const previousTimesheets = queryClient.getQueriesData({
        queryKey: ['timesheets'],
      });

      // Find the timesheet being deleted for validation
      let timesheetToDelete: Timesheet | null = null;
      queryClient
        .getQueriesData<any>({ queryKey: ['timesheets'] })
        .forEach(([_, data]) => {
          if (data?.data) {
            const found = data.data.find(
              (t: Timesheet) => t.id === timesheetId,
            );
            if (found) timesheetToDelete = found;
          }
        });

      // Check business rules before optimistic update
      if (timesheetToDelete?.status === 'APPROVED') {
        throw new Error(
          'Cannot delete approved timesheets. Contact HR for assistance.',
        );
      }

      // Optimistically remove from all timesheet queries
      queryClient.setQueriesData<any>({ queryKey: ['timesheets'] }, (old) => {
        if (!old) return old;

        return {
          ...old,
          data: old.data.filter(
            (timesheet: Timesheet) => timesheet.id !== timesheetId,
          ),
          pagination: {
            ...old.pagination,
            total: old.pagination.total - 1,
          },
        };
      });

      // Return a context object with the snapshotted value
      return { previousTimesheets, timesheetToDelete };
    },
    onError: (error, timesheetId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTimesheets) {
        context.previousTimesheets.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Show error toast
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete timesheet';
      toast.error(errorMessage);

      console.error('Delete timesheet error:', error);
    },
    onSuccess: (data, timesheetId) => {
      // Show success toast
      toast.success(data.message || 'Timesheet deleted successfully');

      console.log('Timesheet deleted successfully:', timesheetId);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is in sync
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });

  return {
    deleteTimesheet: mutation.mutate,
    deleteTimesheetAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

// Helper hook with confirmation dialog
export function useTimesheetDeleteWithConfirmation() {
  const deleteMutation = useTimesheetDelete();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    timesheet: Timesheet | null;
  }>({
    open: false,
    timesheet: null,
  });

  const deleteTimesheetWithConfirmation = (timesheet: Timesheet) => {
    // Check business rules first
    if (timesheet.status === 'APPROVED') {
      toast.error(
        'Cannot delete approved timesheets. Contact HR for assistance.',
      );
      return;
    }

    // Open confirmation dialog
    setConfirmDialog({
      open: true,
      timesheet,
    });
  };

  const handleConfirmDelete = () => {
    if (confirmDialog.timesheet) {
      deleteMutation.deleteTimesheet(confirmDialog.timesheet.id);
      setConfirmDialog({ open: false, timesheet: null });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ open: false, timesheet: null });
  };

  const getConfirmationDetails = () => {
    if (!confirmDialog.timesheet) return { title: '', description: '' };

    const timesheet = confirmDialog.timesheet;
    return {
      title: 'Delete Timesheet',
      description: `Are you sure you want to delete this timesheet for ${formatDisplayDate(new Date(timesheet.date))}? You logged ${formatWorkingHours(timesheet.working_time)} and the status is ${timesheet.status}. This action cannot be undone.`,
    };
  };

  return {
    ...deleteMutation,
    deleteTimesheetWithConfirmation,
    confirmDialog: {
      open: confirmDialog.open,
      onOpenChange: (open: boolean) => {
        if (!open) handleCancelDelete();
      },
      onConfirm: handleConfirmDelete,
      onCancel: handleCancelDelete,
      ...getConfirmationDetails(),
    },
  };
}

// Bulk delete hook for multiple timesheets
export function useTimesheetBulkDelete() {
  const { authState } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      timesheetIds: string[],
    ): Promise<{ deleted: number; failed: number; errors: string[] }> => {
      if (!authState.isAuthenticated || !authState.user) {
        throw new Error('User not authenticated');
      }

      console.log('Bulk deleting timesheets:', timesheetIds);

      let deleted = 0;
      let failed = 0;
      const errors: string[] = [];

      // Delete each timesheet individually (since backend doesn't have bulk delete)
      for (const id of timesheetIds) {
        try {
          await apiClient.deleteTimesheet(id);
          deleted++;
        } catch (error) {
          failed++;
          errors.push(
            `Failed to delete timesheet ${id}: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          );
        }
      }

      return { deleted, failed, errors };
    },
    onSuccess: (result) => {
      // Invalidate all timesheet queries
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });

      // Show result toast
      if (result.failed === 0) {
        toast.success(`Successfully deleted ${result.deleted} timesheets`);
      } else {
        toast.error(
          `Deleted ${result.deleted}, failed ${result.failed} timesheets`,
        );
      }

      console.log('Bulk delete result:', result);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete timesheets';
      toast.error(errorMessage);
      console.error('Bulk delete error:', error);
    },
  });

  return {
    bulkDeleteTimesheets: mutation.mutate,
    bulkDeleteTimesheetsAsync: mutation.mutateAsync,
    isBulkDeleting: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}
