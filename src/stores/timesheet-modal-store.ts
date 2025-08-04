import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Timesheet } from '@/types';

interface TimesheetFormData {
  date: string;
  workingTime: number;
  type: 'NORMAL' | 'OVERTIME' | 'HOLIDAY';
  note?: string;
  projectId?: string;
  taskId?: string;
}

interface TimesheetModalState {
  // Modal state
  isOpen: boolean;
  mode: 'create' | 'edit';

  // Data state
  editingTimesheet: Timesheet | null;
  selectedDate: string | null; // Pre-filled date when opening modal

  // Form state
  formData: Partial<TimesheetFormData>;

  // Actions
  openCreateModal: (date?: string) => void;
  openEditModal: (timesheet: Timesheet) => void;
  closeModal: () => void;
  setFormData: (data: Partial<TimesheetFormData>) => void;
  resetStore: () => void;
}

const initialFormData: Partial<TimesheetFormData> = {
  date: '',
  workingTime: 8,
  type: 'NORMAL',
  note: '',
  projectId: '',
  taskId: '',
};

export const useTimesheetModalStore = create<TimesheetModalState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isOpen: false,
      mode: 'create',
      editingTimesheet: null,
      selectedDate: null,
      formData: initialFormData,

      // Actions
      openCreateModal: (date) => {
        const today = new Date().toISOString().split('T')[0];
        set({
          isOpen: true,
          mode: 'create',
          editingTimesheet: null,
          selectedDate: date || today,
          formData: {
            ...initialFormData,
            date: date || today,
          },
        });
      },

      openEditModal: (timesheet) => {
        set({
          isOpen: true,
          mode: 'edit',
          editingTimesheet: timesheet,
          selectedDate: timesheet.date.split('T')[0],
          formData: {
            date: timesheet.date.split('T')[0],
            workingTime:
              typeof timesheet.working_time === 'string'
                ? parseFloat(timesheet.working_time)
                : timesheet.working_time,
            type: timesheet.type,
            note: timesheet.note || '',
            projectId: timesheet.project?.id || '',
            taskId: timesheet.task?.id || '',
          },
        });
      },

      closeModal: () => {
        set({
          isOpen: false,
          mode: 'create',
          editingTimesheet: null,
          selectedDate: null,
          formData: initialFormData,
        });
      },

      setFormData: (data) => {
        set((state) => ({
          formData: { ...state.formData, ...data },
        }));
      },

      resetStore: () => {
        set({
          isOpen: false,
          mode: 'create',
          editingTimesheet: null,
          selectedDate: null,
          formData: initialFormData,
        });
      },
    }),
    {
      name: 'timesheet-modal-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);
