export {
  usePunishments,
  useCurrentMonthPunishments,
  usePunishmentSummary,
  type UsePunishmentsOptions,
} from './use-punishments';

export {
  useCreateComplaint,
  useTimesheetComplaints,
  useUpdateComplaint,
  canComplainAboutTimesheet,
} from './use-punishment-complaint';

// Re-export types for convenience
export type {
  PunishmentRecord,
  TimesheetComplaint,
  PunishmentSummary,
  CreateComplaintData,
  PunishmentFilters,
} from '@/types/punishment';
