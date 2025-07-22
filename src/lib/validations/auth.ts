import { z } from 'zod';

// Base validation rules
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(30, 'Password must be less than 30 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  );

const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(
    /^[a-zA-Z0-9._-]+$/,
    'Username can only contain letters, numbers, dots, hyphens, and underscores',
  );

const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

// Login form validation schema
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username or email is required')
    .refine((value) => {
      // Allow either username or email format
      return (
        z.string().email().safeParse(value).success ||
        usernameSchema.safeParse(value).success
      );
    }, 'Please enter a valid username or email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

// Signup form validation schema
export const signupSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    name: nameSchema,
    surname: nameSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password validation schema
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    token: z.string().min(1, 'Reset token is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Export types for TypeScript
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Field validation helpers
export const validateField = {
  email: (value: string) => emailSchema.safeParse(value),
  password: (value: string) => passwordSchema.safeParse(value),
  username: (value: string) => usernameSchema.safeParse(value),
  name: (value: string) => nameSchema.safeParse(value),
};

// Common validation messages
export const validationMessages = {
  required: (field: string) => `${field} is required`,
  minLength: (field: string, min: number) =>
    `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) =>
    `${field} must be less than ${max} characters`,
  email: 'Please enter a valid email address',
  passwordMismatch: 'Passwords do not match',
  passwordWeak:
    'Password must contain at least one uppercase letter, one lowercase letter, and one number',
};
