// Auth API Request Types (based on backend DTOs)
export interface LoginRequest {
  username: string; // Backend uses username but accepts email
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  name: string;
  surname: string;
}

// Auth API Response Types (based on backend responses)
export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  surname?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
  timestamp?: string;
  path?: string;
}

// Frontend Form Types (re-export from validation schemas)
export type {
  LoginFormData,
  SignupFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
} from '@/lib/validations/auth';

// Auth State Types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Form Validation Types
export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FormFieldError[];
}

// OAuth Types
export interface GoogleAuthData {
  email: string;
  name: string;
  picture?: string;
}

// Auth Context Types
export interface AuthContextValue {
  authState: AuthState;
  login: (
    data: import('@/lib/validations/auth').LoginFormData,
  ) => Promise<void>;
  signup: (
    data: import('@/lib/validations/auth').SignupFormData,
  ) => Promise<void>;
  logout: () => void;
  googleAuth: () => void;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}
