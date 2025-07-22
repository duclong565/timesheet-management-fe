'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from './login-form';
import { SignupForm } from './signup-form';
import { ForgotPasswordModal } from './forgot-password-modal';
import { useAuth } from '@/contexts/auth-context';
import { Clock } from 'lucide-react';
import { env } from '@/lib/env';

type AuthMode = 'login' | 'signup';

export function AuthCard() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { authState } = useAuth();

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Clock className="h-5 w-5" />
              </div>
              <div className="text-center">
                <CardTitle className="text-xl">{env.APP_NAME}</CardTitle>
                <CardDescription className="text-xs">
                  {env.COMPANY_NAME}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {mode === 'login' ? (
            <LoginForm
              onToggleMode={toggleMode}
              onForgotPassword={handleForgotPassword}
            />
          ) : (
            <SignupForm onToggleMode={toggleMode} />
          )}
        </CardContent>
      </Card>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={handleCloseForgotPassword}
      />
    </>
  );
}
