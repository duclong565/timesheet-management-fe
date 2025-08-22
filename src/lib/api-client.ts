import {
  User,
  Role,
  AuthResponse,
  LoginCredentials,
  ApiResponse,
  PaginatedResponse,
  Timesheet,
  CreateTimesheetDto,
  TimesheetQuery,
  TimesheetComplaint,
  Request,
  CreateRequestDto,
  RequestQuery,
  Project,
  Client,
  Task,
  TaskQuery,
  WorkingTime,
  Branch,
  DashboardResponse,
  UserQuery,
  BaseQuery,
  WeekSubmission,
  SubmitWeekDto,
  ApproveWeekSubmissionDto,
} from '@/types';
import type {
  TeamCalendarData,
  TeamCalendarQuery,
} from '@/types/team-calendar';
import type { AbsenceType } from '@/types/requests';
import { toast } from 'sonner';

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  surname: string;
  username: string;
}

interface ProjectData {
  project_name: string;
  project_code: string;
  client_id?: string;
  start_date?: string;
  end_date?: string;
  project_type?: string;
  all_user?: boolean;
  status?: string;
  note?: string;
}

interface TaskData {
  task_name: string;
  project_id?: string;
  is_billable?: boolean;
  description?: string;
}

interface ClientData {
  client_name: string;
  contact_info?: string;
}

interface WorkingTimeData {
  morning_start_at: string;
  morning_end_at: string;
  afternoon_start_at: string;
  afternoon_end_at: string;
  apply_date: string;
}

interface TimesheetResponseData {
  timesheet_ids: string[];
  status: 'APPROVED' | 'REJECTED';
  note?: string;
}

interface RequestResponseData {
  request_id: string;
  status: 'APPROVED' | 'REJECTED';
  note?: string;
}

interface ProfileData {
  name?: string;
  surname?: string;
  phone?: string;
  address?: string;
  sex?: 'MALE' | 'FEMALE' | 'OTHER';
}

interface AbsenceTypeInput {
  name: string;
  description?: string;
  is_active?: boolean;
}

// Safe localStorage utility for SSR compatibility
function safeLocalStorage(): Storage {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  // Dummy storage for SSR
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  } as Storage;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = 'http://localhost:3000/time-management';

    // Initialize token from localStorage if available
    const storage = safeLocalStorage();
    this.token = storage.getItem('auth_token');
  }

  // ====================================
  // AUTHENTICATION METHODS
  // ====================================

  setToken(token: string) {
    this.token = token;
    const storage = safeLocalStorage();
    storage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    const storage = safeLocalStorage();
    storage.removeItem('auth_token');
  }

  getToken(): string | null {
    return this.token;
  }

  // ====================================
  // HTTP METHODS
  // ====================================

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      hasToken: !!this.token,
      headers: config.headers,
    });

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', {
          status: response.status,
          url,
          error: errorData,
        });
        throw new ApiError(
          errorData.message || 'An error occurred',
          response.status,
          errorData,
        );
      }

      const data = await response.json();
      console.log('API Success:', { url, data });
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.isAuthError) {
          toast.error('Your session has expired. Please log in again.');
          this.clearToken();
          // Optionally redirect to login page here
        }
        throw error;
      }

      throw new ApiError('Network error occurred', 0, { originalError: error });
    }
  }

  private async get<T>(
    endpoint: string,
    params?: Record<string, unknown> | object,
  ): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  private async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ====================================
  // AUTHENTICATION ENDPOINTS
  // ====================================

  async login(
    credentials: LoginCredentials,
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await this.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials,
    );
    this.setToken(response.data.token);
    return response;
  }

  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await this.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      userData,
    );
    this.setToken(response.data.token);
    return response;
  }

  async getProfile(): Promise<User> {
    return this.get<User>('/auth/profile');
  }

  async googleLogin(): Promise<void> {
    // Redirect to Google OAuth
    window.location.href = `${this.baseURL}/auth/google`;
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  // ====================================
  // USER ENDPOINTS
  // ====================================

  async getUsers(query?: UserQuery): Promise<PaginatedResponse<User>> {
    return this.get<PaginatedResponse<User>>('/users', query);
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.get<ApiResponse<User>>(`/users/${id}`);
  }

  async updateUser(
    id: string,
    userData: Partial<User>,
  ): Promise<ApiResponse<User>> {
    return this.patch<ApiResponse<User>>(`/users/${id}`, userData);
  }

  async updateProfile(profileData: ProfileData): Promise<ApiResponse<User>> {
    return this.patch<ApiResponse<User>>('/users/me', profileData);
  }

  async changePassword(
    passwordData: PasswordChangeData,
  ): Promise<ApiResponse<void>> {
    return this.patch<ApiResponse<void>>(
      '/users/me/change-password',
      passwordData,
    );
  }

  async getUserStats(): Promise<ApiResponse<any>> {
    return this.get<ApiResponse<any>>('/users/stats');
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.get<ApiResponse<User>>('/users/me');
  }

  // ====================================
  // PROJECT ENDPOINTS
  // ====================================

  async getProjects(query?: BaseQuery): Promise<PaginatedResponse<Project>> {
    return this.get<PaginatedResponse<Project>>('/projects', query);
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    return this.get<ApiResponse<Project>>(`/projects/${id}`);
  }

  async createProject(projectData: ProjectData): Promise<ApiResponse<Project>> {
    return this.post<ApiResponse<Project>>('/projects', projectData);
  }

  async updateProject(
    id: string,
    projectData: Partial<Project>,
  ): Promise<ApiResponse<Project>> {
    return this.patch<ApiResponse<Project>>(`/projects/${id}`, projectData);
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/projects/${id}`);
  }

  // ====================================
  // TASK ENDPOINTS
  // ====================================

  async getTasks(query?: TaskQuery): Promise<PaginatedResponse<Task>> {
    return this.get<PaginatedResponse<Task>>('/tasks', query);
  }

  async getTask(id: string): Promise<ApiResponse<Task>> {
    return this.get<ApiResponse<Task>>(`/tasks/${id}`);
  }

  async createTask(taskData: TaskData): Promise<ApiResponse<Task>> {
    return this.post<ApiResponse<Task>>('/tasks', taskData);
  }

  async updateTask(
    id: string,
    taskData: Partial<Task>,
  ): Promise<ApiResponse<Task>> {
    return this.patch<ApiResponse<Task>>(`/tasks/${id}`, taskData);
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/tasks/${id}`);
  }

  // ====================================
  // USER PROJECT ENDPOINTS
  // ====================================

  async getUserProjects(userId: string): Promise<ApiResponse<Project[]>> {
    return this.get<ApiResponse<Project[]>>(
      `/user-projects/user/${userId}/projects`,
    );
  }

  // ====================================
  // TIMESHEET ENDPOINTS
  // ====================================

  async getTimesheets(
    query?: TimesheetQuery,
  ): Promise<PaginatedResponse<Timesheet>> {
    return this.get<PaginatedResponse<Timesheet>>('/timesheets', query);
  }

  async getTimesheet(id: string): Promise<ApiResponse<Timesheet>> {
    return this.get<ApiResponse<Timesheet>>(`/timesheets/${id}`);
  }

  async createTimesheet(
    timesheetData: CreateTimesheetDto,
  ): Promise<ApiResponse<Timesheet>> {
    return this.post<ApiResponse<Timesheet>>('/timesheets', timesheetData);
  }

  async updateTimesheet(
    id: string,
    timesheetData: Partial<Timesheet>,
  ): Promise<ApiResponse<Timesheet>> {
    return this.patch<ApiResponse<Timesheet>>(
      `/timesheets/${id}`,
      timesheetData,
    );
  }

  async deleteTimesheet(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/timesheets/${id}`);
  }

  async responseTimesheet(
    responseData: TimesheetResponseData,
  ): Promise<ApiResponse<Timesheet>> {
    return this.post<ApiResponse<Timesheet>>(
      '/timesheets/response',
      responseData,
    );
  }

  // ====================================
  // WEEK SUBMISSION ENDPOINTS
  // ====================================

  async submitWeekForApproval(
    submitData: SubmitWeekDto,
  ): Promise<ApiResponse<WeekSubmission>> {
    return this.post<ApiResponse<WeekSubmission>>(
      '/timesheets/submit-week',
      submitData,
    );
  }

  async getWeekSubmissions(): Promise<ApiResponse<WeekSubmission[]>> {
    return this.get<ApiResponse<WeekSubmission[]>>(
      '/timesheets/week-submissions',
    );
  }

  async isWeekSubmitted(
    weekStartDate: string,
  ): Promise<ApiResponse<{ isSubmitted: boolean }>> {
    return this.get<ApiResponse<{ isSubmitted: boolean }>>(
      `/timesheets/week-submitted/${weekStartDate}`,
    );
  }

  async approveWeekSubmission(
    submissionId: string,
    approveData: Omit<ApproveWeekSubmissionDto, 'submission_id'>,
  ): Promise<ApiResponse<WeekSubmission>> {
    return this.patch<ApiResponse<WeekSubmission>>(
      `/timesheets/week-submissions/${submissionId}/approve`,
      approveData,
    );
  }

  async getPendingApprovals(): Promise<ApiResponse<WeekSubmission[]>> {
    return this.get<ApiResponse<WeekSubmission[]>>(
      '/timesheets/pending-approvals',
    );
  }

  // ====================================
  // REQUEST ENDPOINTS
  // ====================================

  async getRequests(query?: RequestQuery): Promise<PaginatedResponse<Request>> {
    return this.get<PaginatedResponse<Request>>('/requests', query);
  }

  async getRequest(id: string): Promise<ApiResponse<Request>> {
    return this.get<ApiResponse<Request>>(`/requests/${id}`);
  }

  async createRequest(
    requestData: CreateRequestDto,
  ): Promise<ApiResponse<Request>> {
    return this.post<ApiResponse<Request>>('/requests', requestData);
  }

  async updateRequest(
    id: string,
    requestData: Partial<Request>,
  ): Promise<ApiResponse<Request>> {
    return this.patch<ApiResponse<Request>>(`/requests/${id}`, requestData);
  }

  async deleteRequest(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/requests/${id}`);
  }

  async responseRequest(
    responseData: RequestResponseData,
  ): Promise<ApiResponse<Request>> {
    return this.post<ApiResponse<Request>>('/requests/response', responseData);
  }

  async getMyRequests(
    query?: RequestQuery,
  ): Promise<PaginatedResponse<Request>> {
    return this.get<PaginatedResponse<Request>>('/requests/my-requests', query);
  }

  async getTeamCalendar(
    query: TeamCalendarQuery,
  ): Promise<ApiResponse<TeamCalendarData>> {
    return this.get<ApiResponse<TeamCalendarData>>(
      '/requests/team-calendar',
      query,
    );
  }

  async getPendingRequests(
    query?: RequestQuery,
  ): Promise<PaginatedResponse<Request>> {
    return this.get<PaginatedResponse<Request>>(
      '/requests/pending-requests',
      query,
    );
  }

  // ====================================
  // WORKING TIME ENDPOINTS
  // ====================================

  async getWorkingTimes(
    query?: BaseQuery,
  ): Promise<PaginatedResponse<WorkingTime>> {
    return this.get<PaginatedResponse<WorkingTime>>('/working-times', query);
  }

  async getWorkingTime(id: string): Promise<ApiResponse<WorkingTime>> {
    return this.get<ApiResponse<WorkingTime>>(`/working-times/${id}`);
  }

  async createWorkingTime(
    workingTimeData: WorkingTimeData,
  ): Promise<ApiResponse<WorkingTime>> {
    return this.post<ApiResponse<WorkingTime>>(
      '/working-times',
      workingTimeData,
    );
  }

  async updateWorkingTime(
    id: string,
    workingTimeData: Partial<WorkingTime>,
  ): Promise<ApiResponse<WorkingTime>> {
    return this.patch<ApiResponse<WorkingTime>>(
      `/working-times/${id}`,
      workingTimeData,
    );
  }

  async deleteWorkingTime(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/working-times/${id}`);
  }

  async getCurrentWorkingTime(): Promise<ApiResponse<WorkingTime>> {
    return this.get<ApiResponse<WorkingTime>>('/working-times/my-current');
  }

  // ====================================
  // DASHBOARD ENDPOINTS
  // ====================================

  async getDashboard(
    query?: BaseQuery,
  ): Promise<ApiResponse<DashboardResponse>> {
    return this.get<ApiResponse<DashboardResponse>>('/dashboard', query);
  }

  async getQuickStats(): Promise<ApiResponse<any>> {
    return this.get<ApiResponse<any>>('/dashboard/quick-stats');
  }

  async getPendingSummary(): Promise<ApiResponse<any>> {
    return this.get<ApiResponse<any>>('/dashboard/pending-summary');
  }

  // ====================================
  // AUDIT LOG ENDPOINTS
  // ====================================

  async getAuditLogs(query?: BaseQuery): Promise<PaginatedResponse<unknown>> {
    return this.get<PaginatedResponse<unknown>>('/audit-logs', query);
  }

  // ====================================
  // SETTINGS ENDPOINTS
  // ====================================

  async getAbsenceTypes(
    query?: BaseQuery,
  ): Promise<PaginatedResponse<AbsenceType>> {
    return this.get<PaginatedResponse<AbsenceType>>('/absence-types', query);
  }

  async createAbsenceType(
    data: AbsenceTypeInput,
  ): Promise<ApiResponse<AbsenceType>> {
    return this.post<ApiResponse<AbsenceType>>('/absence-types', data);
  }

  async updateAbsenceType(
    id: string,
    data: AbsenceTypeInput,
  ): Promise<ApiResponse<AbsenceType>> {
    return this.put<ApiResponse<AbsenceType>>(`/absence-types/${id}`, data);
  }

  async deleteAbsenceType(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/absence-types/${id}`);
  }

  async getBranches(): Promise<PaginatedResponse<Branch>> {
    return this.get<PaginatedResponse<Branch>>('/branches');
  }

  async getPositions(): Promise<PaginatedResponse<unknown>> {
    return this.get<PaginatedResponse<unknown>>('/positions');
  }

  async getCapabilities(): Promise<PaginatedResponse<unknown>> {
    return this.get<PaginatedResponse<unknown>>('/capabilities');
  }


  async getClients(): Promise<PaginatedResponse<unknown>> {
    return this.get<PaginatedResponse<unknown>>('/clients');
  }

  async getRoles(): Promise<PaginatedResponse<Role>> {
    return this.get<PaginatedResponse<Role>>('/roles');
  }

  // ====================================
  // CLIENT ENDPOINTS
  // ====================================

  async getClients(query?: BaseQuery): Promise<PaginatedResponse<Client>> {
    return this.get<PaginatedResponse<Client>>('/clients', query);
  }

  async getClient(id: string): Promise<ApiResponse<Client>> {
    return this.get<ApiResponse<Client>>(`/clients/${id}`);
  }

  async createClient(clientData: ClientData): Promise<ApiResponse<Client>> {
    return this.post<ApiResponse<Client>>('/clients', clientData);
  }

  async updateClient(
    id: string,
    clientData: Partial<Client>,
  ): Promise<ApiResponse<Client>> {
    return this.patch<ApiResponse<Client>>(`/clients/${id}`, clientData);
  }

  async deleteClient(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/clients/${id}`);
  }

  // ====================================
  // PUNISHMENT ENDPOINTS (Timesheet-based)
  // ====================================

  async getPunishments(query?: {
    year?: number;
    month?: number;
    user_id?: string;
    has_punishment?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Timesheet>> {
    const params = {
      ...query,
      has_punishment: true, // Always filter for punishment records
    };
    return this.get<PaginatedResponse<Timesheet>>('/timesheets', params);
  }

  // ====================================
  // COMPLAINT ENDPOINTS
  // ====================================

  async createComplaint(complaintData: {
    timesheet_id: string;
    complain: string;
  }): Promise<ApiResponse<TimesheetComplaint>> {
    return this.post<ApiResponse<TimesheetComplaint>>(
      '/timesheet-complaints',
      complaintData,
    );
  }

  async getComplaints(query?: {
    timesheet_id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<TimesheetComplaint>> {
    return this.get<PaginatedResponse<TimesheetComplaint>>(
      '/timesheet-complaints',
      query,
    );
  }

  async updateComplaint(
    id: string,
    data: { complain: string },
  ): Promise<ApiResponse<TimesheetComplaint>> {
    return this.patch<ApiResponse<TimesheetComplaint>>(
      `/timesheet-complaints/${id}`,
      data,
    );
  }

  async getComplaintsByTimesheet(
    timesheetId: string,
  ): Promise<ApiResponse<TimesheetComplaint[]>> {
    return this.get<ApiResponse<TimesheetComplaint[]>>(
      `/timesheet-complaints/timesheet/${timesheetId}`,
    );
  }

  // ====================================
  // HEALTH CHECK
  // ====================================

  async healthCheck(): Promise<ApiResponse<unknown>> {
    return this.get<ApiResponse<unknown>>('/health');
  }
}

// ====================================
// ERROR HANDLING
// ====================================

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isAuthError(): boolean {
    return this.status === 401;
  }

  get isForbiddenError(): boolean {
    return this.status === 403;
  }

  get isValidationError(): boolean {
    return this.status === 400;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }
}

// ====================================
// SINGLETON INSTANCE
// ====================================

export const apiClient = new ApiClient();
export default apiClient;
