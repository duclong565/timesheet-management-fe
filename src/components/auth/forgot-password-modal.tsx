'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { useAuth } from '@/contexts/auth-context';
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from '@/lib/validations/auth';
import { Loader2, Mail, CheckCircle } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) {
  const { authState, resetPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsSubmitting(true);
      await resetPassword(data.email);
      setIsSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (
          errorMessage.includes('email') ||
          errorMessage.includes('user not found')
        ) {
          setError('email', { message: 'Email address not found' });
        } else {
          setError('root', { message: error.message });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setIsSuccess(false);
    setIsSubmitting(false);
    onClose();
  };

  const isLoading = isSubmitting || authState.isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSuccess ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Email Sent
              </>
            ) : (
              <>
                <Mail className="h-5 w-5" />
                Reset Password
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isSuccess
              ? "We've sent you a password reset link. Please check your email."
              : "Enter your email address and we'll send you a link to reset your password."}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Did not receive the email? Check your spam folder or</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsSuccess(false)}
                className="p-0 h-auto"
              >
                try again
              </Button>
            </div>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email address"
              register={register}
              error={errors.email}
              icon={<Mail className="h-4 w-4" />}
              autoComplete="email"
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

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
