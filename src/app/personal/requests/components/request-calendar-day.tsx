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
  PENDING: 'bg-gray-50 border-gray-200',
  APPROVED: 'bg-green-50 border-green-200',
  REJECTED: 'bg-red-50 border-red-200',
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

      // If not holding a modifier key for multi-select, also toggle the mode.
      if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const newMode = onToggleMode(date);
        onDateClick(date, newMode);
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
        return 'bg-blue-100 border-blue-300 ring-2 ring-blue-200';
      }

      // If there are requests, use the first request's status for background
      if (cellState.requests.length > 0) {
        const firstRequest = cellState.requests[0];
        return (
          STATUS_STYLES[firstRequest.status as keyof typeof STATUS_STYLES] ||
          'bg-white'
        );
      }

      return 'bg-white';
    };

    // Determine if day should be interactive
    const isInteractive = isCurrentMonth;

    return (
      <td
        ref={ref}
        className={cn(
          'relative h-full w-full p-0',
          !isCurrentMonth && 'bg-gray-50',
          className,
        )}
        {...props}
      >
        <div
          role="button"
          tabIndex={isInteractive ? 0 : -1}
          className={cn(
            'relative flex h-full min-h-[120px] w-full flex-col items-start justify-start p-2 text-left',
            'border border-gray-200 rounded-none',
            isInteractive
              ? 'cursor-pointer hover:bg-gray-50'
              : 'cursor-default',
            getBackgroundStyle(),
            isCurrentDay && 'ring-2 ring-blue-500',
            !isCurrentMonth && 'text-gray-400',
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
                isCurrentDay && 'font-bold text-blue-600',
                !isCurrentMonth && 'text-gray-400',
              )}
            >
              {dayNumber}
            </span>

            {/* Mode indicator */}
            {cellState.mode !== 'FULL_DAY' && isCurrentMonth && (
              <Badge
                variant="outline"
                className="h-4 px-1 text-xs bg-white/80 border-gray-300"
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
            <div className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full shadow-sm" />
          )}

          {/* Selection indicator */}
          {cellState.isSelected && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full shadow-sm" />
          )}
        </div>
      </td>
    );
  },
);

RequestCalendarDay.displayName = 'RequestCalendarDay';
