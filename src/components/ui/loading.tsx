import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'pulse' | 'dots';
}

export function Loading({
  className,
  size = 'md',
  variant = 'spinner',
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  if (variant === 'spinner') {
    return (
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  if (variant === 'pulse') {
    return (
      <div
        className={cn(
          'animate-pulse rounded-full bg-gray-300',
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1', className)}>
        <div
          className={cn(
            'animate-bounce rounded-full bg-gray-300',
            sizeClasses[size],
          )}
        />
        <div
          className={cn(
            'animate-bounce rounded-full bg-gray-300',
            sizeClasses[size],
          )}
          style={{ animationDelay: '0.1s' }}
        />
        <div
          className={cn(
            'animate-bounce rounded-full bg-gray-300',
            sizeClasses[size],
          )}
          style={{ animationDelay: '0.2s' }}
        />
      </div>
    );
  }

  return null;
}

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loading size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({
  isVisible,
  message = 'Loading...',
  children,
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isVisible && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="text-center">
            <Loading size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
