'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { GoogleAuthButton } from './google-auth-button';
import { useAuth } from '@/contexts/auth-context';
import { loginSchema, LoginFormData } from '@/lib/validations/auth';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useState } from 'react';

interface LoginFormProps {
  onToggleMode?: () => void;
  onForgotPassword?: () => void;
}

export function LoginForm({ onToggleMode, onForgotPassword }: LoginFormProps) {
  const { authState, login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      await login(data);
    } catch (error) {
      // Handle specific error cases
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (
          errorMessage.includes('username') ||
          errorMessage.includes('user not found')
        ) {
          setError('username', { message: 'User not found' });
        } else if (errorMessage.includes('password')) {
          setError('password', { message: 'Invalid password' });
        } else {
          setError('root', { message: error.message });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || authState.isLoading;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Username or Email"
          name="username"
          type="text"
          placeholder="Enter your username or email"
          register={register}
          error={errors.username}
          icon={<Mail className="h-4 w-4" />}
          autoComplete="username"
          required
          disabled={isLoading}
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          register={register}
          error={errors.password}
          icon={<Lock className="h-4 w-4" />}
          autoComplete="current-password"
          required
          disabled={isLoading}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              id="rememberMe"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              disabled={isLoading}
              {...register('rememberMe')}
            />
            <label
              htmlFor="rememberMe"
              className="text-sm text-muted-foreground"
            >
              Remember me
            </label>
          </div>

          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm font-medium text-primary hover:underline"
            disabled={isLoading}
          >
            Forgot password?
          </button>
        </div>

        {/* Display root errors */}
        {errors.root && (
          <div className="text-sm text-destructive text-center">
            {errors.root.message}
          </div>
        )}

        {/* Display auth errors */}
        {authState.error && (
          <div className="text-sm text-destructive text-center">
            {authState.error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Sign in
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <GoogleAuthButton disabled={isLoading} />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onToggleMode}
          className="font-medium text-primary hover:underline"
          disabled={isLoading}
        >
          Sign up
        </button>
      </p>
    </div>
  );
}
