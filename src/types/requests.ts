export type RequestType = 'OFF' | 'REMOTE' | 'ONSITE';
export type PeriodType = 'FULL_DAY' | 'MORNING' | 'AFTERNOON' | 'TIME';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TimeType = 'LATE_ARRIVAL' | 'EARLY_DEPARTURE'; // For "Đi muộn" / "Về sớm"

export interface Request {
  id: string;
  user_id: string;
  request_type: RequestType;
  period_type: PeriodType;
  start_date: string; // YYYY-MM-DD format
  end_date: string; // YYYY-MM-DD format
  start_time?: string; // HH:mm format (for TIME requests)
  end_time?: string; // HH:mm format (for TIME requests)
  time_type?: TimeType; // For TIME requests
  reason: string;
  absence_type_id?: string; // For OFF requests
  project_id?: string; // For REMOTE/ONSITE requests
  location?: string; // For ONSITE requests
  note?: string;
  status: RequestStatus;
  approved_by_id?: string;
  approved_at?: string;
  rejected_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRequestDto {
  request_type: RequestType;
  period_type: PeriodType;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  time_type?: TimeType;
  reason: string;
  absence_type_id?: string;
  project_id?: string;
  location?: string;
  note?: string;
}

export interface UpdateRequestDto {
  reason?: string;
  note?: string;
  start_time?: string;
  end_time?: string;
  time_type?: TimeType;
  project_id?: string;
  location?: string;
}

export interface RequestQuery {
  request_type?: RequestType;
  status?: RequestStatus;
  start_date?: string;
  end_date?: string;
  year?: number;
  month?: number;
  page?: number;
  limit?: number;
}

export interface CalendarCellState {
  date: Date;
  mode: PeriodType;
  requests: Request[];
  isSelected: boolean;
  hasConflict: boolean;
}

export interface CalendarState {
  currentDate: Date;
  selectedDates: Date[];
  cellStates: Map<string, CalendarCellState>; // date string -> state
  selectionMode: 'single' | 'range';
  activeRequestType?: RequestType;
}

export interface RequestFilters {
  requestType: RequestType | 'ALL';
  year: number;
  month: number;
}

// Absence types for OFF requests
export interface AbsenceType {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

// Request statistics
export interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  by_type: {
    off: number;
    remote: number;
    onsite: number;
  };
}
