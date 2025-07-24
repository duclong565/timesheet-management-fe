import {
  User,
  AuthResponse,
  LoginCredentials,
  ApiResponse,
  PaginatedResponse,
  Timesheet,
  CreateTimesheetDto,
  TimesheetQuery,
  Request,
  CreateRequestDto,
  RequestQuery,
  Project,
  Task,
  TaskQuery,
  WorkingTime,
  DashboardResponse,
  UserQuery,
  BaseQuery,
} from '@/types';
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

interface ComplaintData {
  timesheet_id: string;
  complain: string;
}

interface ComplaintReplyData {
  complain_reply: string;
}

interface ProfileData {
  name?: string;
  surname?: string;
  phone?: string;
  address?: string;
  sex?: 'MALE' | 'FEMALE' | 'OTHER';
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
    return this.patch<ApiResponse<User>>('/users/profile', profileData);
  }

  async changePassword(
    passwordData: PasswordChangeData,
  ): Promise<ApiResponse<void>> {
    return this.patch<ApiResponse<void>>(
      '/users/change-password',
      passwordData,
    );
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

  async getTeamCalendar(query?: BaseQuery): Promise<ApiResponse<unknown>> {
    return this.get<ApiResponse<unknown>>('/requests/team-calendar', query);
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

  // ====================================
  // DASHBOARD ENDPOINTS
  // ====================================

  async getDashboard(
    query?: BaseQuery,
  ): Promise<ApiResponse<DashboardResponse>> {
    return this.get<ApiResponse<DashboardResponse>>('/dashboard', query);
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

  async getAbsenceTypes(): Promise<PaginatedResponse<unknown>> {
    return this.get<PaginatedResponse<unknown>>('/absence-types');
  }

  async getBranches(): Promise<PaginatedResponse<unknown>> {
    return this.get<PaginatedResponse<unknown>>('/branches');
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

  async getRoles(): Promise<PaginatedResponse<unknown>> {
    return this.get<PaginatedResponse<unknown>>('/roles');
  }

  // ====================================
  // COMPLAINT ENDPOINTS
  // ====================================

  async getTimesheetComplaints(
    query?: BaseQuery,
  ): Promise<PaginatedResponse<unknown>> {
    return this.get<PaginatedResponse<unknown>>('/timesheet-complaints', query);
  }

  async createTimesheetComplaint(
    complaintData: ComplaintData,
  ): Promise<ApiResponse<unknown>> {
    return this.post<ApiResponse<unknown>>(
      '/timesheet-complaints',
      complaintData,
    );
  }

  async replyToComplaint(
    id: string,
    replyData: ComplaintReplyData,
  ): Promise<ApiResponse<unknown>> {
    return this.patch<ApiResponse<unknown>>(
      `/timesheet-complaints/${id}/reply`,
      replyData,
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
  constructor(message: string, public status: number, public data?: unknown) {
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
