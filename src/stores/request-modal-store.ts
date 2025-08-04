'use client';

import { create } from 'zustand';
import type { RequestType, PeriodType, Request } from '@/types/requests';

interface RequestModalState {
  // Modal visibility
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isViewModalOpen: boolean;

  // Modal type and context
  activeRequestType?: RequestType;
  activePeriodType?: PeriodType;
  selectedDates: Date[];
  editingRequest?: Request;
  viewingRequest?: Request;

  // Modal actions
  openCreateModal: (
    requestType: RequestType,
    periodType: PeriodType,
    selectedDates: Date[],
  ) => void;
  openEditModal: (request: Request) => void;
  openViewModal: (request: Request) => void;
  closeAllModals: () => void;

  // Helper getters
  getModalTitle: () => string;
  getSelectedDateRange: () => string;
  hasMultipleDates: () => boolean;
}

export const useRequestModalStore = create<RequestModalState>((set, get) => ({
  // Initial state
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isViewModalOpen: false,
  activeRequestType: undefined,
  activePeriodType: undefined,
  selectedDates: [],
  editingRequest: undefined,
  viewingRequest: undefined,

  // Actions
  openCreateModal: (requestType, periodType, selectedDates) => {
    console.log('📝 Opening create modal:', {
      requestType,
      periodType,
      selectedDates: selectedDates.map((d) => d.toISOString().split('T')[0]),
    });

    set({
      isCreateModalOpen: true,
      isEditModalOpen: false,
      isViewModalOpen: false,
      activeRequestType: requestType,
      activePeriodType: periodType,
      selectedDates,
      editingRequest: undefined,
      viewingRequest: undefined,
    });
  },

  openEditModal: (request) => {
    console.log('✏️ Opening edit modal:', {
      id: request.id,
      type: request.request_type,
      status: request.status,
    });

    set({
      isCreateModalOpen: false,
      isEditModalOpen: true,
      isViewModalOpen: false,
      activeRequestType: request.request_type,
      activePeriodType: request.period_type,
      selectedDates: [new Date(request.start_date)], // TODO: Handle date ranges
      editingRequest: request,
      viewingRequest: undefined,
    });
  },

  openViewModal: (request) => {
    console.log('👀 Opening view modal:', {
      id: request.id,
      type: request.request_type,
      status: request.status,
    });

    set({
      isCreateModalOpen: false,
      isEditModalOpen: false,
      isViewModalOpen: true,
      activeRequestType: request.request_type,
      activePeriodType: request.period_type,
      selectedDates: [new Date(request.start_date)], // TODO: Handle date ranges
      editingRequest: undefined,
      viewingRequest: request,
    });
  },

  closeAllModals: () => {
    console.log('❌ Closing all request modals');

    set({
      isCreateModalOpen: false,
      isEditModalOpen: false,
      isViewModalOpen: false,
      activeRequestType: undefined,
      activePeriodType: undefined,
      selectedDates: [],
      editingRequest: undefined,
      viewingRequest: undefined,
    });
  },

  // Helper functions
  getModalTitle: () => {
    const state = get();
    if (state.isEditModalOpen && state.editingRequest) {
      return `Edit ${state.activeRequestType} Request`;
    }
    if (state.isViewModalOpen && state.viewingRequest) {
      return `View ${state.activeRequestType} Request`;
    }
    if (state.isCreateModalOpen && state.activeRequestType) {
      return `Create ${state.activeRequestType} Request`;
    }
    return 'Request';
  },

  getSelectedDateRange: () => {
    const state = get();
    const dates = state.selectedDates;

    if (dates.length === 0) return '';
    if (dates.length === 1) {
      return dates[0].toLocaleDateString();
    }

    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const start = sortedDates[0].toLocaleDateString();
    const end = sortedDates[sortedDates.length - 1].toLocaleDateString();

    return `${start} - ${end}`;
  },

  hasMultipleDates: () => {
    const state = get();
    return state.selectedDates.length > 1;
  },
}));
