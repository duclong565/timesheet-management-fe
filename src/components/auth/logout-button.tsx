'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface LogoutButtonProps {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
  confirmBeforeLogout?: boolean;
  children?: React.ReactNode;
}

export function LogoutButton({
  variant = 'ghost',
  size = 'default',
  className,
  showIcon = true,
  showText = true,
  confirmBeforeLogout = false,
  children,
}: LogoutButtonProps) {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (confirmBeforeLogout) {
      const confirmed = window.confirm('Are you sure you want to log out?');
      if (!confirmed) return;
    }

    try {
      setIsLoggingOut(true);
      logout();
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn('flex items-center gap-2', className)}
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        showIcon && <LogOut className="h-4 w-4" />
      )}
      {showText && (
        <span>{children || (isLoggingOut ? 'Logging out...' : 'Log out')}</span>
      )}
    </Button>
  );
}
