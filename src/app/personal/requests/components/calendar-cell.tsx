'use client';

import { useMemo } from 'react';
import { isToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Request, PeriodType, CalendarCellState } from '@/types/requests';

interface CalendarCellProps {
  date: Date;
  cellState: CalendarCellState;
  isCurrentMonth: boolean;
  onDateClick: (date: Date, mode: PeriodType) => void;
  onRequestClick: (request: Request) => void;
  onToggleMode: (date: Date) => PeriodType;
}



const MODE_LABELS: Record<PeriodType, string> = {
  FULL_DAY: 'Full Day',
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  TIME: 'Time',
};

const REQUEST_TYPE_COLORS = {
  OFF: {
    bg: 'bg-red-500',
    text: 'text-white',
    hover: 'hover:bg-red-600',
  },
  REMOTE: {
    bg: 'bg-blue-500',
    text: 'text-white',
    hover: 'hover:bg-blue-600',
  },
  ONSITE: {
    bg: 'bg-green-500',
    text: 'text-white',
    hover: 'hover:bg-green-600',
  },
};

const STATUS_BACKGROUNDS = {
  PENDING: 'bg-gray-50',
  APPROVED: 'bg-green-50',
  REJECTED: 'bg-red-50',
};

export function CalendarCell({
  date,
  cellState,
  isCurrentMonth,
  onDateClick,
  onRequestClick,
  onToggleMode,
}: CalendarCellProps) {
  const dayNumber = date.getDate();
  const isCurrentDay = isToday(date);

  // Get the background color based on request status and selection
  const cellBackground = useMemo(() => {
    if (cellState.isSelected) {
      return 'bg-blue-100 border-blue-300';
    }

    if (cellState.requests.length === 0) return 'bg-white';

    // If there are multiple requests, use the first one's status
    const primaryRequest = cellState.requests[0];
    return STATUS_BACKGROUNDS[primaryRequest.status];
  }, [cellState.requests, cellState.isSelected]);

  // Handle date click - toggle through modes
  const handleDateClick = () => {
    const nextMode = onToggleMode(date);

    // If switching to TIME mode, automatically trigger the callback
    if (nextMode === 'TIME') {
      onDateClick(date, nextMode);
    }
  };

  // Handle period button clicks (for Full Day, Morning, Afternoon)
  const handlePeriodClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (cellState.mode !== 'TIME') {
      onDateClick(date, cellState.mode);
    }
  };

  // Handle request badge clicks
  const handleRequestClick = (e: React.MouseEvent, request: Request) => {
    e.stopPropagation();
    onRequestClick(request);
  };

  // Render request badges
  const renderRequestBadges = () => {
    return cellState.requests.map((request) => {
      const colors = REQUEST_TYPE_COLORS[request.request_type];
      const periodLabel =
        request.period_type === 'FULL_DAY'
          ? 'Full Day'
          : request.period_type === 'MORNING'
          ? 'Morning'
          : request.period_type === 'AFTERNOON'
          ? 'Afternoon'
          : 'Time';

      return (
        <Badge
          key={request.id}
          className={cn(
            'text-xs px-1 py-0 cursor-pointer',
            colors.bg,
            colors.text,
            colors.hover,
          )}
          onClick={(e) => handleRequestClick(e, request)}
        >
          {request.request_type === 'OFF'
            ? 'Off'
            : request.request_type === 'REMOTE'
            ? 'Remote'
            : 'Onsite'}
          {request.period_type !== 'FULL_DAY' && (
            <div className="text-xs opacity-90">{periodLabel}</div>
          )}
        </Badge>
      );
    });
  };

  // Render status indicator
  const renderStatusIndicator = () => {
    if (cellState.requests.length === 0) return null;

    const hasApproved = cellState.requests.some((r) => r.status === 'APPROVED');
    const hasPending = cellState.requests.some((r) => r.status === 'PENDING');
    const hasRejected = cellState.requests.some((r) => r.status === 'REJECTED');

    if (hasApproved) {
      return (
        <Badge variant="default" className="text-xs px-1 py-0 bg-green-600">
          Approved
        </Badge>
      );
    } else if (hasPending) {
      return (
        <Badge variant="secondary" className="text-xs px-1 py-0">
          Pending
        </Badge>
      );
    } else if (hasRejected) {
      return (
        <Badge variant="destructive" className="text-xs px-1 py-0">
          Rejected
        </Badge>
      );
    }
  };

  return (
    <div
      className={cn(
        'min-h-[100px] p-2 border-r border-b cursor-pointer transition-colors relative',
        cellBackground,
        isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
        isCurrentDay && 'ring-2 ring-blue-500 ring-inset',
        'hover:bg-gray-50',
      )}
      onClick={handleDateClick}
    >
      {/* Date Number */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            'text-sm font-medium',
            isCurrentDay && 'text-blue-600 font-bold',
          )}
        >
          {dayNumber}
        </span>

        {/* Current Mode Indicator */}
        {isCurrentMonth && (
          <span className="text-xs text-gray-500">
            {MODE_LABELS[cellState.mode]}
          </span>
        )}
      </div>

      {/* Request Badges */}
      <div className="space-y-1 mb-2">{renderRequestBadges()}</div>

      {/* Status Indicator */}
      <div className="flex justify-center">{renderStatusIndicator()}</div>

      {/* Period Action Button (for non-TIME modes) */}
      {isCurrentMonth && cellState.mode !== 'TIME' && (
        <div className="mt-2">
          <button
            className={cn(
              'w-full text-xs py-1 px-2 rounded border border-gray-300',
              'hover:bg-gray-100 transition-colors',
              'focus:outline-none focus:ring-1 focus:ring-blue-500',
            )}
            onClick={handlePeriodClick}
          >
            {MODE_LABELS[cellState.mode]}
          </button>
        </div>
      )}

      {/* Three dots for more options */}
      {cellState.requests.length > 0 && (
        <div className="text-center mt-1">
          <span className="text-gray-400 text-sm">•••</span>
        </div>
      )}

      {/* Conflict indicator */}
      {cellState.hasConflict && (
        <div className="absolute top-1 left-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
}
