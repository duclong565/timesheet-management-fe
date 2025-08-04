export interface PunishmentRecord {
  id: string;
  date: string; // ISO date string
  user_id: string;

  // Registration hours (planned check-in/out times)
  check_in: string | null; // HH:mm format
  check_out: string | null; // HH:mm format

  // Actual check-in/out times
  actual_check_in: string | null; // HH:mm format
  actual_check_out: string | null; // HH:mm format

  // Violation data
  check_in_late: number; // Minutes late
  check_out_early: number; // Minutes early

  // Punishment details
  money: number; // Punishment amount
  punishment: string | null; // Punishment description

  // Editor info
  edited_by: {
    id: string;
    name: string;
    surname: string;
  } | null;

  // User info
  user: {
    id: string;
    name: string;
    surname: string;
  };

  // Complaint data
  complaints: TimesheetComplaint[];

  created_at: string;
  updated_at: string;
}

export interface TimesheetComplaint {
  id: string;
  timesheet_id: string;
  complain: string | null;
  complain_reply: string | null;
  created_at: string;
  updated_at: string;
}

export interface PunishmentSummary {
  total_punished: number;
  total_money: number;
  month: number;
  year: number;
}

export interface CreateComplaintData {
  timesheet_id: string;
  complain: string;
}

export interface PunishmentFilters {
  year: number;
  month: number;
  user_id?: string;
  has_violation?: boolean;
}
