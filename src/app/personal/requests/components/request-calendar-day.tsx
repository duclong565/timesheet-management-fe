'use client';

import { forwardRef } from 'react';
import { isToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CalendarCellState, PeriodType, Request } from '@/types/requests';

interface RequestCalendarDayProps {
  date: Date;
  cellState: CalendarCellState;
  isCurrentMonth: boolean;
  onDateClick: (date: Date, mode: PeriodType) => void;
  onRequestClick: (request: Request) => void;
  onToggleMode: (date: Date) => PeriodType;
  onDateSelect?: (date: Date) => void;
  children?: React.ReactNode;
  className?: string;
}



const REQUEST_TYPE_COLORS = {
  OFF: 'destructive',
  REMOTE: 'default',
  ONSITE: 'secondary',
} as const;

const STATUS_STYLES = {
  PENDING: 'bg-yellow-500/20 text-yellow-800 dark:text-yellow-300',
  APPROVED: 'bg-green-500/20 text-green-800 dark:text-green-300',
  REJECTED: 'bg-red-500/20 text-red-800 dark:text-red-300',
};

export const RequestCalendarDay = forwardRef<
  HTMLTableCellElement,
  RequestCalendarDayProps
>(
  (
    {
      date,
      cellState,
      isCurrentMonth,
      onDateClick,
      onRequestClick,
      onToggleMode,
      onDateSelect,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const isCurrentDay = isToday(date);
    const dayNumber = date.getDate();

    // Handle day click to toggle mode and potentially select date
    const handleDayClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Always trigger date selection
      if (onDateSelect) {
        onDateSelect(date);
      }
    };

    // Handle request click
    const handleRequestClick = (e: React.MouseEvent, request: Request) => {
      e.stopPropagation();
      onRequestClick(request);
    };

    // Determine background style based on status and selection
    const getBackgroundStyle = () => {
      if (cellState.isSelected) {
        return 'bg-accent text-accent-foreground';
      }

      // If there are requests, use the first request's status for background
      if (cellState.requests.length > 0) {
        const firstRequest = cellState.requests[0];
        return (
          STATUS_STYLES[firstRequest.status as keyof typeof STATUS_STYLES] ||
          'bg-transparent'
        );
      }

      return 'bg-transparent';
    };

    // Determine if day should be interactive
    const isInteractive = isCurrentMonth;

    return (
      <td
        ref={ref}
        className={cn(
          'relative h-full w-full p-0',
          !isCurrentMonth && 'bg-muted/50',
          className,
        )}
        {...props}
      >
        <div
          role="button"
          tabIndex={isInteractive ? 0 : -1}
          className={cn(
            'relative flex h-full min-h-[120px] w-full flex-col items-start justify-start p-2 text-left',
            'border rounded-none',
            isInteractive
              ? 'cursor-pointer hover:bg-accent/50'
              : 'cursor-default',
            getBackgroundStyle(),
            isCurrentDay && 'ring-2 ring-primary',
            !isCurrentMonth && 'text-muted-foreground',
            'transition-all duration-200',
          )}
          onClick={isInteractive ? handleDayClick : undefined}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (isInteractive) {
                handleDayClick(e as unknown as React.MouseEvent<HTMLDivElement>);
              }
            }
          }}
        >
          {/* Day number and mode indicator */}
          <div className="flex w-full items-start justify-between mb-1">
            <span
              className={cn(
                'text-sm font-medium',
                isCurrentDay && 'font-bold text-primary',
                !isCurrentMonth && 'text-muted-foreground',
              )}
            >
              {dayNumber}
            </span>

            {/* Mode indicator */}
            {cellState.mode !== 'FULL_DAY' && isCurrentMonth && (
              <Badge
                variant="outline"
                className="h-4 px-1 text-xs bg-background/80 border-border"
              >
                {cellState.mode === 'MORNING'
                  ? 'AM'
                  : cellState.mode === 'AFTERNOON'
                  ? 'PM'
                  : 'TIME'}
              </Badge>
            )}
          </div>

          {/* Request badges */}
          <div className="w-full flex-1 space-y-1">
            {cellState.requests.map((request) => (
              <Badge
                key={request.id}
                variant={
                  REQUEST_TYPE_COLORS[
                    request.request_type as keyof typeof REQUEST_TYPE_COLORS
                  ]
                }
                className="w-full justify-center text-xs transition-opacity cursor-pointer hover:opacity-80"
                onClick={(e) => handleRequestClick(e, request)}
              >
                {request.request_type}
                {request.period_type !== 'FULL_DAY' && (
                  <span className="ml-1">
                    {request.period_type === 'MORNING'
                      ? 'AM'
                      : request.period_type === 'AFTERNOON'
                      ? 'PM'
                      : 'TIME'}
                  </span>
                )}
              </Badge>
            ))}
          </div>

          {children}

          {/* Conflict indicator */}
          {cellState.hasConflict && (
            <div className="absolute top-1 left-1 w-2 h-2 bg-destructive rounded-full shadow-sm" />
          )}

          {/* Selection indicator */}
          {cellState.isSelected && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full shadow-sm" />
          )}
        </div>
      </td>
    );
  },
);

RequestCalendarDay.displayName = 'RequestCalendarDay';
