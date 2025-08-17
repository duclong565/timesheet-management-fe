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

export interface TeamCalendarQuery {
  month: number;
  year: number;
  projectId?: string;
  branchId?: string;
}
