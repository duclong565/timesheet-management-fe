
import * as React from 'react';
import { cn } from '@/lib/utils';

interface ContentLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ContentLayout({ children, className, ...props }: ContentLayoutProps) {
  return (
    <div
      className={cn('flex flex-col gap-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}
