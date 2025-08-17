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
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
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

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['my-requests', filters],
    queryFn: () => apiClient.getMyRequests(filters),
  });

  const requests = requestsData?.data || [];

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

  const handleDateInteraction = (date: Date, mode: string) => {
    console.log('📅 Date interaction:', {
      date: date.toISOString().split('T')[0],
      mode,
      action: 'period_button_clicked',
    });
    openCreateModal('OFF', mode, [date]);
  };

  // This is the new handler for multi-selection
  const handleDaySelect = (date: Date) => {
    const newSelectedDates = selectedDates.some(
      (selectedDate) => selectedDate.getTime() === date.getTime(),
    )
      ? selectedDates.filter(
          (selectedDate) => selectedDate.getTime() !== date.getTime(),
        )
      : [...selectedDates, date];
    onDateSelect(newSelectedDates);
  };

  return (
    <div className="w-full space-y-4">
      {/* Selection Summary */}
      {hasSelection && (
        <Alert variant={"default"}>
          <AlertDescription>
            <div className="flex items-center justify-between w-full">
              <div>
                <span className="text-sm font-medium text-white">
                  {selectedDates.length} date
                  {selectedDates.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
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
            month={calendarDate}
            onMonthChange={(month) => {
              onFiltersChange({
                ...filters,
                year: month.getFullYear(),
                month: month.getMonth() + 1,
              });
            }}
            className="w-full"
            components={{
              Day: ({ day: { date: dayDate } }) => {
                const isSelected = selectedDates.some(
                  (d) => d.getTime() === dayDate.getTime(),
                );
                const requestsForDay = requests.filter(
                  (r) =>
                    new Date(r.start_date).toDateString() ===
                    dayDate.toDateString(),
                );

                return (
                  <RequestCalendarDay
                    date={dayDate}
                    cellState={{
                      requests: requestsForDay,
                      isSelected: isSelected,
                      mode: 'FULL_DAY', // Default mode
                      hasConflict: false, // Placeholder
                    }}
                    isCurrentMonth={isSameMonth(dayDate, calendarDate)}
                    onDateClick={handleDateInteraction}
                    onRequestClick={onRequestClick}
                    onToggleMode={() => 'FULL_DAY'} // Placeholder
                    onDateSelect={() => handleDaySelect(dayDate)}
                  />
                );
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Calendar Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
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
              <div className="w-3 h-3 rounded border border-yellow-300 bg-yellow-500/20"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border border-green-300 bg-green-500/20"></div>
              <span>Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border border-red-300 bg-red-500/20"></div>
              <span>Rejected</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
