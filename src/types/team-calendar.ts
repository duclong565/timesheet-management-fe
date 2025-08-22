export interface TeamCalendarDay {
  day: number;
  weekday: string;
  isWeekend: boolean;
}

export interface TeamCalendarEntry {
  type: string;
  absence_type: string | null;
  project: {
    id: string;
    name: string;
  } | null;
  requestId: string;
  period: 'FULL_DAY' | 'MORNING' | 'AFTERNOON';
}

export interface TeamCalendarUser {
  user: {
    id: string;
    name: string;
    position: string;
  };
  days: Array<TeamCalendarEntry | null>;
}

export interface TeamCalendarData {
  month: number;
  year: number;
  days: TeamCalendarDay[];
  users: TeamCalendarUser[];
}

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';
export type RequestType = 'OFF' | 'REMOTE' | 'ONSITE' | 'ALL';

export interface TeamCalendarQuery {
  // Required filters
  month: number;
  year: number;

  // Optional filters matching backend
  status?: RequestStatus;
  requestType?: RequestType;
  projectId?: string;
  branchId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TeamCalendarFilters {
  year: number;
  month: number;
  status: RequestStatus;
  requestType: RequestType;
  projectId?: string;
  search?: string;
}
