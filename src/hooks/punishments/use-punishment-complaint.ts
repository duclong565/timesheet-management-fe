import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import type { CreateComplaintData } from '@/types/punishment';

// Hook for creating complaints
export function useCreateComplaint() {
  const { authState } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateComplaintData) => {
      if (!authState.isAuthenticated || !authState.user) {
        throw new Error('User not authenticated');
      }

      console.log('Creating complaint:', data);

      const response = await apiClient.createComplaint({
        timesheet_id: data.timesheet_id,
        complain: data.complain,
      });

      console.log('Create complaint response:', response);
      return response;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['punishments'] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['timesheet-complaints'] });

      toast.success('Complaint submitted successfully!');
    },
    onError: (error: Error) => {
      const message = error?.message || 'Failed to submit complaint';
      toast.error(message);
    },
  });

  return {
    createComplaint: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

// Hook for getting complaints by timesheet
export function useTimesheetComplaints(timesheetId: string | null) {
  const { authState } = useAuth();

  const query = useQuery({
    queryKey: ['timesheet-complaints', timesheetId],
    queryFn: async () => {
      if (!timesheetId) return [];

      if (!authState.isAuthenticated || !authState.user) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching complaints for timesheet:', timesheetId);

      const response = await apiClient.getComplaintsByTimesheet(timesheetId);
      console.log('Timesheet complaints response:', response);

      return response.data || [];
    },
    enabled: !!timesheetId && !!authState.isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    complaints: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Hook for updating complaint text (user can edit before admin replies)
export function useUpdateComplaint() {
  const { authState } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, complain }: { id: string; complain: string }) => {
      if (!authState.isAuthenticated || !authState.user) {
        throw new Error('User not authenticated');
      }

      console.log('Updating complaint:', { id, complain });

      const response = await apiClient.updateComplaint(id, { complain });
      console.log('Update complaint response:', response);

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['punishments'] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['timesheet-complaints'] });

      toast.success('Complaint updated successfully!');
    },
    onError: (error: Error) => {
      const message = error?.message || 'Failed to update complaint';
      toast.error(message);
    },
  });

  return {
    updateComplaint: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

// Utility function to check if user can complain about a timesheet
export function canComplainAboutTimesheet(
  punishment: {
    user_id: string;
    complaints?: { complain_reply?: string | null }[];
  },
  currentUserId: string,
): { canComplain: boolean; reason?: string } {
  // User can only complain about their own timesheets
  if (punishment.user_id !== currentUserId) {
    return {
      canComplain: false,
      reason: 'Can only complain about your own timesheets',
    };
  }

  // Check if there's already a complaint
  const hasComplaint =
    punishment.complaints && punishment.complaints.length > 0;
  if (hasComplaint && punishment.complaints) {
    const complaint = punishment.complaints[0];
    // If admin hasn't replied, user can still edit
    if (!complaint.complain_reply) {
      return { canComplain: true, reason: 'Can edit existing complaint' };
    } else {
      return {
        canComplain: false,
        reason: 'Admin has already replied to complaint',
      };
    }
  }

  // No existing complaint, user can create one
  return { canComplain: true };
}
