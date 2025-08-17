'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { RequestFilters } from './components/request-filters';
import { RequestsCalendar } from './components/requests-calendar';
import { RequestActions } from './components/request-actions';
import { RequestModals } from './components/request-modals';
import { useRequestModalStore } from '@/stores/request-modal-store';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
// import { useAuth } from '@/contexts/auth-context'; // TODO: Use for authentication in Phase 3
import type {
  RequestFilters as RequestFiltersType,
  Request,
  CreateRequestDto,
} from '@/types/requests';

export default function RequestsPage() {
  // const { authState } = useAuth(); // TODO: Use for authentication checks in Phase 3
  const [filters, setFilters] = useState<RequestFiltersType>({
    requestType: 'ALL',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1, // 1-based month
  });

  const queryClient = useQueryClient();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const { closeAllModals } = useRequestModalStore();

  const createRequestMutation = useMutation({
    mutationFn: (data: CreateRequestDto) => apiClient.createRequest(data),
    onSuccess: () => {
      toast.success('Request submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
      setSelectedDates([]); // Clear selected dates after successful submission
      closeAllModals();
    },
    onError: (error) => {
      console.error('Request submission failed:', error);
      toast.error('Failed to submit request. Please try again.');
    },
  });

  // Handle filter changes
  const handleFiltersChange = (newFilters: RequestFiltersType) => {
    setFilters(newFilters);
  };

  // Handle calendar interactions
  const handleDateSelect = (
    dates: Date[] | undefined,
  ) => {
    // react-day-picker's onSelect for "multiple" mode returns Date[] | undefined
    setSelectedDates(dates || []);
  };

  const handleDateClick = (date: Date) => {
    // This function will be used for the 4-state toggle, not selection
    console.log('Date clicked for mode toggle:', date);
    // For now, we open the modal directly as per the old flow if needed
    // openCreateModal('OFF', 'FULL_DAY', [date]);
  };

  const handleRequestClick = (request: Request) => {
    console.log('🔄 Request clicked:', {
      id: request.id,
      type: request.request_type,
      status: request.status,
      action: 'edit_or_view',
    });
    // TODO: Open edit/view modal for existing request
  };

  // Handle request submission
  const handleRequestSubmit = async (data: CreateRequestDto) => {
    await createRequestMutation.mutateAsync(data);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My requests</h1>
          <p className="text-muted-foreground">
            Manage your off-day, remote work, and onsite requests
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter Section */}
      <RequestFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Actions Section */}
      <RequestActions selectedDates={selectedDates} />

      {/* Calendar Section */}
      <RequestsCalendar
        filters={filters}
        selectedDates={selectedDates}
        onDateSelect={handleDateSelect} // This now handles multi-selection
        onRequestClick={handleRequestClick}
        onFiltersChange={handleFiltersChange}
      />

      {/* Modals */}
      <RequestModals
        onSubmit={handleRequestSubmit}
        isLoading={createRequestMutation.isPending}
      />
    </div>
  );
}
