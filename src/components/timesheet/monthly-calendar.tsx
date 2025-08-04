'use client';

import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { useCurrentMonthTimesheets } from '@/hooks/timesheet';
import { useTimesheetModalStore } from '@/stores/timesheet-modal-store';
import { toNumber } from '@/lib/date-utils';
import type { Timesheet } from '@/types';

interface MonthlyCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onDayClick?: (date: Date) => void;
}

export function MonthlyCalendar({
  currentDate,
  onDateChange,
  onDayClick,
}: MonthlyCalendarProps) {
  const [selectedMonth, setSelectedMonth] = useState(currentDate);
  const { openCreateModal } = useTimesheetModalStore();

  // Fetch timesheets for the entire month
  const { timesheets, isLoading } = useCurrentMonthTimesheets(selectedMonth);

  // Group timesheets by date
  const timesheetsByDate = useMemo(() => {
    const grouped: Record<string, Timesheet[]> = {};
    timesheets.forEach((timesheet: Timesheet) => {
      const date = timesheet.date.split('T')[0]; // Get YYYY-MM-DD part
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(timesheet);
    });
    return grouped;
  }, [timesheets]);

  // Calculate daily totals for the month
  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    Object.keys(timesheetsByDate).forEach((dateKey) => {
      const dayTimesheets = timesheetsByDate[dateKey] || [];
      totals[dateKey] = dayTimesheets.reduce((sum: number, ts: Timesheet) => {
        return sum + toNumber(ts.working_time);
      }, 0);
    });
    return totals;
  }, [timesheetsByDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth =
      direction === 'prev'
        ? subMonths(selectedMonth, 1)
        : addMonths(selectedMonth, 1);
    setSelectedMonth(newMonth);
    onDateChange(newMonth);
  };

  const handleDayClick = (date: Date) => {
    // Check if date is in the future
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    const isFutureDate = date > today;

    if (onDayClick) {
      onDayClick(date);
    } else if (!isFutureDate) {
      // Default behavior: open create modal for the clicked date (only for today/past dates)
      openCreateModal(format(date, 'yyyy-MM-dd'));
    }
    // Do nothing if it's a future date
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedMonth(today);
    onDateChange(today);
  };

  // Custom day content to show timesheet data
  const dayContent = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayTimesheets = timesheetsByDate[dateKey] || [];
    const totalHours = dailyTotals[dateKey] || 0;

    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-0.5 p-1">
        <span className="text-sm font-medium">{date.getDate()}</span>
        {dayTimesheets.length > 0 && (
          <div className="flex flex-col gap-0.5 w-full items-center">
            <div className="text-xs font-medium text-center">
              {totalHours.toFixed(1)}h
            </div>
            {totalHours >= 8 ? (
              <Badge variant="default" className="text-xs px-1 py-0 h-3">
                Complete
              </Badge>
            ) : totalHours > 0 ? (
              <Badge variant="secondary" className="text-xs px-1 py-0 h-3">
                Partial
              </Badge>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm">Loading calendar data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">
          {format(selectedMonth, 'MMMM yyyy')}
        </h3>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('prev')}
            className="h-7 w-7"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-7 px-3 text-sm"
          >
            Today
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('next')}
            className="h-7 w-7"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-2">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={(date) => date && onDateChange(date)}
          month={selectedMonth}
          onMonthChange={setSelectedMonth}
          showOutsideDays={true}
          className="w-full"
          components={{
            DayButton: ({ day, ...props }) => (
              <Button
                {...props}
                variant="ghost"
                className="h-10 w-full p-0 relative hover:bg-accent text-sm"
                onClick={() => handleDayClick(day.date)}
              >
                {dayContent(day.date)}
              </Button>
            ),
          }}
        />

        {/* Legend */}
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="h-2 w-4"></Badge>
            <span>Complete Day (8+ hours)</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="h-2 w-4"></Badge>
            <span>Partial Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-4 border border-muted rounded"></div>
            <span>No entries</span>
          </div>
        </div>
      </div>
    </div>
  );
}
