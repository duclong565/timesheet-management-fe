'use client';

import { useMemo } from 'react';
import { format, isSameMonth, addMonths, subMonths } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { RequestCalendarDay } from './request-calendar-day'; // We still need this for custom rendering
import type { RequestFilters, Request } from '@/types/requests';
import { useRequestModalStore } from '@/stores/request-modal-store';

interface RequestsCalendarProps {
  filters: RequestFilters;
  selectedDates: Date[];
  onDateSelect: (dates: Date[]) => void;
  onRequestClick: (request: Request) => void;
  onFiltersChange: (filters: RequestFilters) => void;
}

export function RequestsCalendar({
  filters,
  selectedDates,
  onDateSelect,
  onRequestClick,
  onFiltersChange,
}: RequestsCalendarProps) {
  // Calculate the calendar month based on filters
  const calendarDate = useMemo(() => {
    // Ensure month is 0-indexed for Date constructor
    return new Date(filters.year, filters.month - 1, 1);
  }, [filters.year, filters.month]);

  // Mock requests data for now - TODO: Replace with actual data fetching
  const mockRequests: Request[] = [
    {
      id: '1',
      user_id: 'user-1',
      request_type: 'OFF',
      period_type: 'FULL_DAY',
      start_date: '2025-07-29',
      end_date: '2025-07-29',
      reason: 'Personal leave',
      status: 'APPROVED',
      created_at: '2025-07-25T00:00:00Z',
      updated_at: '2025-07-25T00:00:00Z',
    },
    {
      id: '2',
      user_id: 'user-1',
      request_type: 'OFF',
      period_type: 'AFTERNOON',
      start_date: '2025-07-30',
      end_date: '2025-07-30',
      reason: 'Medical appointment',
      status: 'APPROVED',
      created_at: '2025-07-26T00:00:00Z',
      updated_at: '2025-07-26T00:00:00Z',
    },
    {
      id: '3',
      user_id: 'user-1',
      request_type: 'REMOTE',
      period_type: 'FULL_DAY',
      start_date: '2025-07-31',
      end_date: '2025-07-31',
      reason: 'Work from home',
      status: 'PENDING',
      created_at: '2025-07-27T00:00:00Z',
      updated_at: '2025-07-27T00:00:00Z',
    },
  ];

  const { openCreateModal } = useRequestModalStore();
  const hasSelection = selectedDates.length > 0;

  // Handle month navigation
  const handlePreviousMonth = () => {
    const previousMonth = subMonths(calendarDate, 1);
    onFiltersChange({
      ...filters,
      year: previousMonth.getFullYear(),
      month: previousMonth.getMonth() + 1,
    });
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(calendarDate, 1);
    onFiltersChange({
      ...filters,
      year: nextMonth.getFullYear(),
      month: nextMonth.getMonth() + 1,
    });
  };

  const handleToday = () => {
    const today = new Date();
    onFiltersChange({
      ...filters,
      year: today.getFullYear(),
      month: today.getMonth() + 1,
    });
  };

  const handleClearSelection = () => {
    onDateSelect([]);
  };

  // This function is now for the 4-state toggle interaction if we keep it.
  // For now, it will open the modal directly.
  const handleDateInteraction = (date: Date, mode: string) => {
    console.log('📅 Date interaction:', {
      date: date.toISOString().split('T')[0],
      mode,
      action: 'period_button_clicked',
    });
    openCreateModal('OFF', mode, [date]);
  };

  

  return (
    <div className="w-full space-y-4">
      {/* Selection Summary */}
      {hasSelection && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-blue-900">
                  {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''}{' '}
                  selected
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear selection
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Calendar */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            {/* Calendar Navigation */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousMonth}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 min-w-[200px]">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="font-medium">
                    {format(calendarDate, 'MMMM yyyy')}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Today Button */}
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
            </div>

            <CardTitle className="text-lg">My Requests</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={onDateSelect}
            month={calendarDate}
            onMonthChange={(month) => {
              onFiltersChange({
                ...filters,
                year: month.getFullYear(),
                month: month.getMonth() + 1,
              });
            }}
            className="w-full"
            classNames={{
              months:
                'flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
              month: 'space-y-4 w-full flex flex-col',
              caption: 'flex justify-center pt-1 relative items-center hidden', // Hide default navigation
              caption_label: 'text-lg font-semibold',
              nav: 'space-x-1 flex items-center hidden', // Hide default navigation
              nav_button:
                'h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100',
              nav_button_previous: 'absolute left-1',
              nav_button_next: 'absolute right-1',
              table: 'w-full border-collapse space-y-1',
              head_row: 'flex w-full',
              head_cell:
                'text-gray-500 rounded-md w-full font-normal text-[0.8rem] text-center p-2',
              row: 'flex w-full mt-2',
              cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent w-full',
              day: 'h-24 w-full p-0 font-normal aria-selected:opacity-100',
              day_selected:
                'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
              day_today: 'bg-accent text-accent-foreground',
              day_outside: 'text-gray-400 opacity-50',
              day_disabled: 'text-gray-400 opacity-50',
              day_range_middle:
                'aria-selected:bg-accent aria-selected:text-accent-foreground',
              day_hidden: 'invisible',
            }}
            
          />
        </CardContent>
      </Card>

      {/* Calendar Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="w-3 h-3 p-0"></Badge>
              <span>Off Request</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="w-3 h-3 p-0"></Badge>
              <span>Remote Request</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="w-3 h-3 p-0"></Badge>
              <span>Onsite Request</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-50 rounded border border-gray-300"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-50 rounded border border-green-300"></div>
              <span>Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-50 rounded border border-red-300"></div>
              <span>Rejected</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
