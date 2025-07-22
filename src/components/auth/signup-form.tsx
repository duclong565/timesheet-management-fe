'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { GoogleAuthButton } from './google-auth-button';
import { useAuth } from '@/contexts/auth-context';
import { signupSchema, SignupFormData } from '@/lib/validations/auth';
import { Loader2, Mail, Lock, User, UserCheck } from 'lucide-react';
import { useState } from 'react';

interface SignupFormProps {
  onToggleMode?: () => void;
}

export function SignupForm({ onToggleMode }: SignupFormProps) {
  const { authState, signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      surname: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsSubmitting(true);
      await signup(data);
    } catch (error) {
      // Handle specific error cases
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (
          errorMessage.includes('username') &&
          errorMessage.includes('already exists')
        ) {
          setError('username', { message: 'Username already exists' });
        } else if (
          errorMessage.includes('email') &&
          errorMessage.includes('already exists')
        ) {
          setError('email', { message: 'Email already exists' });
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
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your information to create your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="First Name"
            name="name"
            type="text"
            placeholder="John"
            register={register}
            error={errors.name}
            icon={<User className="h-4 w-4" />}
            autoComplete="given-name"
            required
            disabled={isLoading}
          />

          <FormField
            label="Last Name"
            name="surname"
            type="text"
            placeholder="Doe"
            register={register}
            error={errors.surname}
            icon={<UserCheck className="h-4 w-4" />}
            autoComplete="family-name"
            required
            disabled={isLoading}
          />
        </div>

        <FormField
          label="Username"
          name="username"
          type="text"
          placeholder="johndoe"
          register={register}
          error={errors.username}
          icon={<User className="h-4 w-4" />}
          autoComplete="username"
          required
          disabled={isLoading}
          description="3-30 characters, letters, numbers, dots, hyphens, and underscores only"
        />

        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="john@example.com"
          register={register}
          error={errors.email}
          icon={<Mail className="h-4 w-4" />}
          autoComplete="email"
          required
          disabled={isLoading}
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="Create a password"
          register={register}
          error={errors.password}
          icon={<Lock className="h-4 w-4" />}
          autoComplete="new-password"
          required
          disabled={isLoading}
          description="At least 6 characters with uppercase, lowercase, and number"
        />

        <FormField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          register={register}
          error={errors.confirmPassword}
          icon={<Lock className="h-4 w-4" />}
          autoComplete="new-password"
          required
          disabled={isLoading}
        />

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
          Create account
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
        Already have an account?{' '}
        <button
          type="button"
          onClick={onToggleMode}
          className="font-medium text-primary hover:underline"
          disabled={isLoading}
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
