'use client';

import { useState } from 'react';
import { addMonths, subMonths, format } from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeamCalendar } from '@/hooks/timesheet';
import { TeamCalendar } from '@/components/timesheet';

export default function TeamCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { calendarData, isLoading, error } = useTeamCalendar({
    month: currentMonth.getMonth() + 1,
    year: currentMonth.getFullYear(),
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-center text-destructive">Failed to load calendar.</div>
      )}

      {calendarData && !isLoading && (
        <TeamCalendar data={calendarData} />
      )}
    </div>
  );
}

