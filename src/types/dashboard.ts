export interface PersonalMetrics {
  total_working_hours: number;
  this_month_hours: number;
  pending_timesheets: number;
  approved_timesheets: number;
  rejected_timesheets: number;
  pending_requests: number;
  approved_requests: number;
  remaining_leave_days: number;
  current_working_time?: {
    id: string;
    total_hours: number;
    morning_hours: number;
    afternoon_hours: number;
  };
}

export interface TeamMetrics {
  total_team_members: number;
  active_team_members: number;
  total_pending_timesheets: number;
  total_pending_requests: number;
  average_working_hours: number;
  total_team_hours_this_month: number;
  top_performers?: Array<{
    user_id: string;
    name: string;
    total_hours: number;
  }>;
}

export interface SystemMetrics {
  total_users: number;
  active_users: number;
  total_projects: number;
  active_projects: number;
  total_timesheets_this_month: number;
  total_requests_this_month: number;
  system_health_score: number;
}

export interface RecentActivity {
  id: string;
  type:
    | 'TIMESHEET_CREATED'
    | 'TIMESHEET_APPROVED'
    | 'TIMESHEET_REJECTED'
    | 'REQUEST_CREATED'
    | 'REQUEST_APPROVED'
    | 'REQUEST_REJECTED'
    | 'WORKING_TIME_UPDATED'
    | 'USER_CREATED'
    | 'PROJECT_CREATED';
  title: string;
  description: string;
  user: {
    id: string;
    name: string;
    surname: string;
  };
  metadata?: {
    timesheet_id?: string;
    request_id?: string;
    working_time_id?: string;
    project_id?: string;
    [key: string]: string | number | boolean | undefined;
  };
  created_at: string;
}

export interface PendingItem {
  id: string;
  type: 'TIMESHEET' | 'REQUEST' | 'WORKING_TIME';
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  user: {
    id: string;
    name: string;
    surname: string;
  };
  created_at: string;
  due_date?: string;
  metadata?: {
    timesheet_date?: string;
    request_start_date?: string;
    request_end_date?: string;
    working_time_apply_date?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface TeamSummaryItem {
  user: {
    id: string;
    name: string;
    surname: string;
    position?: string;
    branch?: string;
  };
  this_month_hours: number;
  pending_timesheets: number;
  pending_requests: number;
  last_activity: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
}

export interface ChartData {
  type: 'BAR' | 'LINE' | 'PIE' | 'DONUT';
  title: string;
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  period?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  endpoint: string;
  method: string;
  icon?: string;
}

export interface DashboardData {
  dashboard_type: 'personal' | 'manager' | 'admin';
  user: {
    id: string;
    name: string;
    surname: string;
    role: string;
  };
  personal_metrics?: PersonalMetrics;
  team_metrics?: TeamMetrics;
  system_metrics?: SystemMetrics;
  recent_activities?: RecentActivity[];
  pending_items?: PendingItem[];
  team_summary?: TeamSummaryItem[];
  charts?: ChartData[];
  quick_actions?: QuickAction[];
}

export interface DashboardApiResponse {
  data: DashboardData;
}
