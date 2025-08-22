// ====================================
// AUTHENTICATION & USER TYPES
// ====================================

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  surname: string;
  role: Role;
  branch?: Branch;
  position?: Position;
  start_date?: string;
  allowed_leavedays: number;
  employee_type?: 'FULLTIME' | 'PARTTIME' | 'INTERN' | 'PROBATION';
  level?: 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'LEAD' | 'MANAGER';
  phone?: string;
  address?: string;
  sex?: 'MALE' | 'FEMALE' | 'OTHER';
  trainer?: User;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  role_name: 'USER' | 'PM' | 'HR' | 'ADMIN';
  description?: string;
  permissions?: RolePermission[];
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission: Permission;
  created_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ====================================
// PROJECT & TASK TYPES
// ====================================

export interface Project {
  id: string;
  project_name: string;
  project_code: string;
  client?: Client;
  start_date?: string;
  end_date?: string;
  note?: string;
  project_type?: string;
  all_user: boolean;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  client_name: string;
  contact_info?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  task_name: string;
  project?: Project;
  is_billable: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

// ====================================
// TIMESHEET TYPES
// ====================================

export interface Timesheet {
  id: string;
  user?: User;
  project?: Project;
  task?: Task;
  date: string;
  working_time: number | string; // Prisma Decimal comes as string
  type: 'NORMAL' | 'OVERTIME' | 'HOLIDAY';
  note?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  check_in?: string;
  check_out?: string;
  actual_check_in?: string;
  actual_check_out?: string;
  check_in_late: number | string; // Prisma Decimal comes as string
  check_out_early: number | string; // Prisma Decimal comes as string
  edited_by?: User;
  money: number | string; // Prisma Decimal comes as string
  punishment?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTimesheetDto {
  date: string;
  workingTime: number;
  type: 'NORMAL' | 'OVERTIME' | 'HOLIDAY';
  note?: string;
  projectId?: string;
  taskId?: string;
}

export interface TimesheetComplaint {
  id: string;
  timesheet: Timesheet;
  complain?: string;
  complain_reply?: string;
  created_at: string;
  updated_at: string;
}

// ====================================
// WEEK SUBMISSION TYPES
// ====================================

export interface WeekSubmission {
  id: string;
  user_id: string;
  week_start_date: string;
  week_end_date: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submitted_at: string;
  approved_by_id?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    surname: string;
    email: string;
  };
  approved_by?: {
    id: string;
    name: string;
    surname: string;
    email: string;
  } | null;
}

export interface SubmitWeekDto {
  week_start_date: string; // Monday date in YYYY-MM-DD format
}

export interface ApproveWeekSubmissionDto {
  submission_id: string;
  action: 'APPROVE' | 'REJECT';
  rejection_reason?: string;
}

// ====================================
// REQUEST TYPES
// ====================================

export interface Request {
  id: string;
  user: User;
  project?: Project;
  request_type: 'OFF' | 'REMOTE' | 'ONSITE';
  absence_type?: AbsenceType;
  start_date: string;
  start_period: 'MORNING' | 'AFTERNOON' | 'FULL_DAY';
  end_date: string;
  end_period: 'MORNING' | 'AFTERNOON' | 'FULL_DAY';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  note?: string;
  modified_by?: User;
  modified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AbsenceType {
  id: string;
  type_name: string;
  description?: string;
  available_days?: number;
  deduct_from_allowed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRequestDto {
  request_type: 'OFF' | 'REMOTE' | 'ONSITE';
  project_id?: string;
  absence_type_id?: string;
  start_date: string;
  start_period: 'MORNING' | 'AFTERNOON' | 'FULL_DAY';
  end_date: string;
  end_period: 'MORNING' | 'AFTERNOON' | 'FULL_DAY';
  note?: string;
}

// ====================================
// WORKING TIME TYPES
// ====================================

export interface WorkingTime {
  id: string;
  user: User;
  morning_start_at: string;
  morning_end_at: string;
  morning_hours: number;
  afternoon_start_at: string;
  afternoon_end_at: string;
  afternoon_hours: number;
  apply_date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

// ====================================
// DASHBOARD TYPES
// ====================================

export interface DashboardResponse {
  dashboard_type: 'personal' | 'manager' | 'admin';
  user: {
    id: string;
    name: string;
    surname: string;
    role: string;
  };
  date_range: {
    start_date?: string;
    end_date?: string;
  };
  personal_metrics?: PersonalMetrics;
  team_metrics?: TeamMetrics;
  system_metrics?: SystemMetrics;
  recent_activities?: RecentActivity[];
  pending_items?: PendingItem[];
  team_summary?: TeamSummaryItem[];
  charts?: ChartData[];
  quick_actions?: QuickAction[];
  summary: {
    total_hours_logged: number;
    completion_rate: number;
    approval_rate: number;
    last_updated: string;
  };
}

export interface PersonalMetrics {
  total_hours_logged: number;
  hours_this_month: number;
  pending_timesheets: number;
  approved_timesheets: number;
  pending_requests: number;
  approved_requests: number;
  overtime_hours: number;
  leave_days_used: number;
  leave_days_remaining: number;
}

export interface TeamMetrics {
  team_size: number;
  total_team_hours: number;
  pending_approvals: number;
  team_productivity: number;
  project_count: number;
  active_projects: number;
}

export interface SystemMetrics {
  total_users: number;
  active_users: number;
  total_projects: number;
  active_projects: number;
  total_hours_logged: number;
  pending_approvals: number;
  system_health: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export interface PendingItem {
  id: string;
  type: 'timesheet' | 'request' | 'working_time';
  title: string;
  user?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface TeamSummaryItem {
  user_id: string;
  name: string;
  surname: string;
  position: string;
  hours_logged: number;
  completion_rate: number;
  pending_items: number;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  title: string;
  data: any[];
  labels: string[];
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  endpoint: string;
  method: string;
  icon?: string;
}

// ====================================
// ORGANIZATIONAL TYPES
// ====================================

export interface Branch {
  id: string;
  branch_name: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  position_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Capability {
  id: string;
  capability_name: string;
  type: 'Point' | 'Text';
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface CapabilitySetting {
  id: string;
  position: Position;
  capability: Capability;
  coefficient?: number;
  created_at: string;
}

// ====================================
// API RESPONSE TYPES
// ====================================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

export interface ValidationErrorResponse extends ErrorResponse {
  errors: Array<{
    field: string;
    message: string;
  }>;
}

// ====================================
// QUERY TYPES
// ====================================

export interface BaseQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface TimesheetQuery extends BaseQuery {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  type?: 'NORMAL' | 'OVERTIME' | 'HOLIDAY';
  user_id?: string;
  project_id?: string;
  task_id?: string;
  start_date?: string;
  end_date?: string;
  has_punishment?: boolean;
}

export interface RequestQuery extends BaseQuery {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  type?: 'OFF' | 'REMOTE' | 'ONSITE';
  startDate?: string;
  endDate?: string;
}

export interface TaskQuery extends BaseQuery {
  project_id?: string;
  is_billable?: boolean;
  has_project?: boolean;
  has_timesheets?: boolean;
  created_after?: string;
  created_before?: string;
}

export interface UserQuery extends BaseQuery {
  role?: string;
  branch_id?: string;
  position_id?: string;
  is_active?: boolean;
  employee_type?: 'FULLTIME' | 'PARTTIME' | 'INTERN' | 'PROBATION';
  level?: 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'LEAD' | 'MANAGER';
}

// ====================================
// UTILITY TYPES
// ====================================

export type UserRole = 'USER' | 'PM' | 'HR' | 'ADMIN';

export interface NavigationItem {
  name: string;
  href: string;
  icon?: string;
  roles?: UserRole[];
  children?: NavigationItem[];
}

export interface PageMeta {
  title: string;
  description?: string;
  requiresAuth?: boolean;
  allowedRoles?: UserRole[];
}

export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

// ====================================
// AUDIT LOG TYPES
// ====================================

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  modified_by: User;
  modified_at: string;
  details?: Record<string, any>;
  created_at: string;
}

// ====================================
// REQUEST CALENDAR TYPES (New System)
// ====================================

export * from './requests';
export * from './background-job';
