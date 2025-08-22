'use client';

import { useMemo } from 'react';
import {
  format,
  isSameMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';
import type { Timesheet, Request } from '@/types';
import type { TeamCalendarData } from '@/types/team-calendar';

interface TeamTimesheetCalendarProps {
  filters: {
    year: number;
    month: number;
    status: string;
    project_id?: string;
    request_type: string;
  };
  timesheets: Timesheet[];
  requests: Request[];
  teamCalendarData?: TeamCalendarData;
  selectedTeamMembers: string[];
  isLoading: boolean;
  onFiltersChange: (filters: any) => void;
}

interface DayData {
  date: Date;
  timesheets: Timesheet[];
  requests: Request[];
  totalHours: number;
  uniqueUsers: Set<string>;
}

export function TeamTimesheetCalendar({
  filters,
  timesheets,
  requests,
  teamCalendarData,
  selectedTeamMembers,
  isLoading,
  onFiltersChange,
}: TeamTimesheetCalendarProps) {
  // Calculate the calendar month based on filters
  const calendarDate = useMemo(() => {
    return new Date(filters.year, filters.month - 1, 1);
  }, [filters.year, filters.month]);

  // Generate calendar days for the month
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(calendarDate), { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(endOfMonth(calendarDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [calendarDate]);

  // Group data by date
  const dayDataMap = useMemo(() => {
    const map = new Map<string, DayData>();

    calendarDays.forEach((date) => {
      const dateKey = format(date, 'yyyy-MM-dd');

      // Filter timesheets for this date
      const dayTimesheets = timesheets.filter((t) => {
        const timesheetDate = t.date.split('T')[0];
        const matchesDate = timesheetDate === dateKey;
        const matchesUser =
          selectedTeamMembers.length === 0 ||
          (t.user?.id && selectedTeamMembers.includes(t.user.id));
        const matchesStatus =
          filters.status === 'ALL' || t.status === filters.status;

        return matchesDate && matchesUser && matchesStatus;
      });

      // Filter requests for this date
      const dayRequests = requests.filter((r) => {
        const matchesDate = dateKey >= r.start_date && dateKey <= r.end_date;
        const matchesUser =
          selectedTeamMembers.length === 0 ||
          ((r.user?.id || r.user_id) &&
            selectedTeamMembers.includes(r.user?.id || r.user_id));
        const matchesType =
          filters.request_type === 'ALL' ||
          filters.request_type === 'TIMESHEET' ||
          r.request_type === filters.request_type;

        return matchesDate && matchesUser && matchesType;
      });

      // Calculate total hours for the day
      const totalHours = dayTimesheets.reduce((sum, t) => {
        const hours =
          typeof t.working_time === 'string'
            ? parseFloat(t.working_time)
            : t.working_time;
        return sum + (hours || 0);
      }, 0);

      // Get unique users for the day
      const uniqueUsers = new Set([
        ...dayTimesheets.map((t) => t.user?.id).filter(Boolean),
        ...dayRequests.map((r) => r.user?.id || r.user_id).filter(Boolean),
      ]);

      map.set(dateKey, {
        date,
        timesheets: dayTimesheets,
        requests: dayRequests,
        totalHours,
        uniqueUsers,
      });
    });

    return map;
  }, [calendarDays, timesheets, requests, selectedTeamMembers, filters]);

  // Handle month navigation
  const handlePreviousMonth = () => {
    const previousMonth = subMonths(calendarDate, 1);
    onFiltersChange({
      year: previousMonth.getFullYear(),
      month: previousMonth.getMonth() + 1,
    });
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(calendarDate, 1);
    onFiltersChange({
      year: nextMonth.getFullYear(),
      month: nextMonth.getMonth() + 1,
    });
  };

  const handleToday = () => {
    const today = new Date();
    onFiltersChange({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
    });
  };

  // Custom day renderer for the calendar
  const renderDay = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayData = dayDataMap.get(dateKey);
    const isCurrentMonth = isSameMonth(date, calendarDate);

    if (!dayData || !isCurrentMonth) {
      return (
        <div className="w-full h-full min-h-[120px] p-2 text-center">
          <div className="text-sm font-medium text-muted-foreground">
            {date.getDate()}
          </div>
        </div>
      );
    }

    const {
      timesheets: dayTimesheets,
      requests: dayRequests,
      totalHours,
      uniqueUsers,
    } = dayData;

    // Group requests by type for display
    const requestsByType = dayRequests.reduce((acc, req) => {
      acc[req.request_type] = (acc[req.request_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="w-full h-full min-h-[120px] p-2 space-y-1">
        {/* Date header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{date.getDate()}</span>
          {uniqueUsers.size > 0 && (
            <Badge variant="outline" className="text-xs h-4 px-1">
              {uniqueUsers.size} users
            </Badge>
          )}
        </div>

        {/* Working hours display */}
        {totalHours > 0 && (
          <div className="text-center">
            <Badge variant="default" className="text-xs">
              {totalHours.toFixed(1)}h
            </Badge>
          </div>
        )}

        {/* Request badges */}
        <div className="space-y-1">
          {requestsByType.OFF > 0 && (
            <Badge
              variant="destructive"
              className="w-full justify-center text-xs"
            >
              Off: {requestsByType.OFF}
            </Badge>
          )}
          {requestsByType.REMOTE > 0 && (
            <Badge variant="default" className="w-full justify-center text-xs">
              Remote: {requestsByType.REMOTE}
            </Badge>
          )}
          {requestsByType.ONSITE > 0 && (
            <Badge
              variant="secondary"
              className="w-full justify-center text-xs"
            >
              Onsite: {requestsByType.ONSITE}
            </Badge>
          )}
        </div>

        {/* Timesheet status indicators */}
        {dayTimesheets.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center">
            {dayTimesheets.filter((t) => t.status === 'PENDING').length > 0 && (
              <div
                className="w-2 h-2 bg-yellow-500 rounded-full"
                title="Pending timesheets"
              />
            )}
            {dayTimesheets.filter((t) => t.status === 'APPROVED').length >
              0 && (
              <div
                className="w-2 h-2 bg-green-500 rounded-full"
                title="Approved timesheets"
              />
            )}
            {dayTimesheets.filter((t) => t.status === 'REJECTED').length >
              0 && (
              <div
                className="w-2 h-2 bg-red-500 rounded-full"
                title="Rejected timesheets"
              />
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
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

            <CardTitle className="text-lg">Team Working Calendar</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {/* Day headers */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day) => {
              const isCurrentMonth = isSameMonth(day, calendarDate);
              return (
                <div
                  key={day.toISOString()}
                  className={`border rounded-lg ${
                    isCurrentMonth
                      ? 'bg-background hover:bg-accent/50'
                      : 'bg-muted/30 text-muted-foreground'
                  } transition-colors cursor-pointer`}
                >
                  {renderDay(day)}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="w-3 h-3 p-0"></Badge>
              <span>Off Requests</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="w-3 h-3 p-0"></Badge>
              <span>Remote Requests</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="w-3 h-3 p-0"></Badge>
              <span>Onsite Requests</span>
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
