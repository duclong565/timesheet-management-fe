'use client';

import { useRequestModalStore } from '@/stores/request-modal-store';
import { OffRequestModal } from './modals/off-request-modal';
import { TimeRequestModal } from './modals/time-request-modal';
import type { CreateRequestDto } from '@/types/requests';

interface RequestModalsProps {
  onSubmit: (data: CreateRequestDto) => Promise<void>;
  isLoading?: boolean;
}

export function RequestModals({
  onSubmit,
  isLoading = false,
}: RequestModalsProps) {
  const {
    isCreateModalOpen,
    isEditModalOpen,
    isViewModalOpen,
    activeRequestType,
    activePeriodType,
    closeAllModals,
  } = useRequestModalStore();

  const handleModalClose = () => {
    closeAllModals();
  };

  const handleSubmit = async (data: CreateRequestDto) => {
    try {
      await onSubmit(data);
      closeAllModals();
    } catch (error) {
      console.error('Request submission failed:', error);
      // Error handling is done in the parent component
      throw error;
    }
  };

  // Determine which modal to show
  const isModalOpen = isCreateModalOpen || isEditModalOpen || isViewModalOpen;

  // TIME period always shows TimeRequestModal
  if (isModalOpen && activePeriodType === 'TIME') {
    return (
      <TimeRequestModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    );
  }

  // For OFF requests (Full Day, Morning, Afternoon)
  if (isModalOpen && activeRequestType === 'OFF') {
    return (
      <OffRequestModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    );
  }

  // For REMOTE requests - TODO: Implement RemoteRequestModal
  if (isModalOpen && activeRequestType === 'REMOTE') {
    return (
      <div>
        {/* TODO: Implement RemoteRequestModal */}
        <OffRequestModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // For ONSITE requests - TODO: Implement OnsiteRequestModal
  if (isModalOpen && activeRequestType === 'ONSITE') {
    return (
      <div>
        {/* TODO: Implement OnsiteRequestModal */}
        <OffRequestModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    );
  }

  return null;
}
