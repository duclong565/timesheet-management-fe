
import * as React from 'react';
import { cn } from '@/lib/utils';

interface ContentHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function ContentHeader({ title, description, children, className, ...props }: ContentHeaderProps) {
  return (
    <div
      className={cn('flex items-center justify-between', className)}
      {...props}
    >
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
