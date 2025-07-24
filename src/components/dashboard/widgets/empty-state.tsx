import { Info } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function EmptyState({
  message,
  icon = <Info className="w-10 h-10 mb-2" />,
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center text-muted-foreground ${sizeClasses[size]}`}
    >
      {icon}
      <div>{message}</div>
    </div>
  );
}
