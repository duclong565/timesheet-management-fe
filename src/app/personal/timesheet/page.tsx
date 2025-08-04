'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  AlertCircle,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { useCurrentWeekTimesheets } from '@/hooks/timesheet/use-timesheets';
import { useActiveUserProjects } from '@/hooks/projects/use-user-projects';
import { useTimesheetDeleteWithConfirmation } from '@/hooks/timesheet/use-timesheet-delete';
import { useSubmitWeekButton } from '@/hooks/timesheet/use-submit-week-button';
import { useAuth } from '@/contexts/auth-context';
import {
  formatDisplayDate,
  formatWorkingHours,
  formatWeekRange,
  toNumber,
} from '@/lib/date-utils';
import { TimesheetModal, MonthlyCalendar } from '@/components/timesheet';
import { PunishmentsTable } from '@/components/punishments';
import { useTimesheetModalStore } from '@/stores/timesheet-modal-store';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export default function PersonalTimesheetPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'Week' | 'Month'>('Week');
  const { authState } = useAuth();

  // Calculate week range
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Fetch data using our hooks
  const {
    timesheets,
    isLoading: timesheetsLoading,
    error: timesheetsError,
    refetch: refetchTimesheets,
  } = useCurrentWeekTimesheets(currentDate);

  const { isLoading: projectsLoading, error: projectsError } =
    useActiveUserProjects();

  const { deleteTimesheetWithConfirmation, isDeleting, confirmDialog } =
    useTimesheetDeleteWithConfirmation();

  const { openCreateModal, openEditModal } = useTimesheetModalStore();

  // Week submission button hook
  const weekStartDateString = format(weekStart, 'yyyy-MM-dd'); // Format for API
  const {
    buttonText,
    isButtonDisabled,
    isSubmitting,
    submitWeek,
    isSubmitted,
    submissionStatus,
  } = useSubmitWeekButton({
    weekStartDate: weekStartDateString,
  });

  // Debug logging to see what the hook is returning
  console.log('🔍 Week Submission Debug:', {
    currentDate: format(currentDate, 'yyyy-MM-dd'),
    weekStart: format(weekStart, 'yyyy-MM-dd'),
    weekStartDateString,
    weekDays: weekDays.map((day) => format(day, 'yyyy-MM-dd')),
    isSubmitted,
    submissionStatus,
    buttonText,
    isButtonDisabled,
  });

  // Helper function to check if a date is today or in the past
  const isDateAllowedForEntry = (date: Date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    return date <= today;
  };

  // Group timesheets by date for easier rendering
  const timesheetsByDate = useMemo(() => {
    const grouped: Record<string, typeof timesheets> = {};
    timesheets.forEach((timesheet) => {
      const date = timesheet.date.split('T')[0]; // Get YYYY-MM-DD part
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(timesheet);
    });
    return grouped;
  }, [timesheets]);

  // Calculate total hours for each day
  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    weekDays.forEach((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayTimesheets = timesheetsByDate[dateKey] || [];
      totals[dateKey] = dayTimesheets.reduce((sum, ts) => {
        return sum + toNumber(ts.working_time);
      }, 0);
    });
    return totals;
  }, [weekDays, timesheetsByDate]);

  // Calculate week total
  const weekTotal = useMemo(() => {
    const total = Object.values(dailyTotals).reduce((sum, daily) => {
      return sum + toNumber(daily);
    }, 0);
    return total;
  }, [dailyTotals]);

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'Week') {
      setCurrentDate(
        direction === 'prev'
          ? subDays(currentDate, 7)
          : addDays(currentDate, 7),
      );
    } else {
      // Month navigation
      setCurrentDate(
        direction === 'prev'
          ? subMonths(currentDate, 1)
          : addMonths(currentDate, 1),
      );
    }
  };

  // Handle loading and error states
  if (timesheetsLoading || projectsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading timesheet data...</span>
        </div>
      </div>
    );
  }

  if (timesheetsError || projectsError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load timesheet data:{' '}
            {timesheetsError?.message || projectsError?.message}
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => {
                refetchTimesheets();
              }}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Personal Timesheet</h1>
          <p className="text-muted-foreground">
            Track and manage your working hours • Week Total:{' '}
            {formatWorkingHours(weekTotal)}
          </p>
        </div>
      </div>

      {/* Date Navigation & Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Date Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateDate('prev')}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 min-w-[200px]">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">
                    {formatDisplayDate(currentDate)}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateDate('next')}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Today Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex border rounded-md">
                {(['Week', 'Month'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className="rounded-none first:rounded-l-md last:rounded-r-md"
                  >
                    {mode}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Week View */}
          {viewMode === 'Week' && (
            <div className="space-y-4">
              {/* Week Header */}
              <div className="grid grid-cols-8 gap-4 pb-2 border-b">
                <div className="font-medium text-sm text-muted-foreground"></div>
                {weekDays.map((day) => (
                  <div key={day.toISOString()} className="text-center">
                    <div className="font-medium">
                      {formatDisplayDate(day, 'DAY_SHORT')}
                    </div>
                    <div
                      className={`text-sm ${
                        isSameDay(day, new Date())
                          ? 'text-primary font-bold'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatDisplayDate(day, 'DAY_MONTH')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Week Time Entries */}
              <div className="grid grid-cols-8 gap-4 items-start">
                <div className="font-medium text-sm">Time Entries</div>
                {weekDays.map((day) => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const dayTimesheets = timesheetsByDate[dateKey] || [];

                  return (
                    <div
                      key={day.toISOString()}
                      className="min-h-[120px] space-y-2"
                    >
                      {/* Render actual timesheet entries */}
                      {dayTimesheets.map((timesheet) => (
                        <div
                          key={timesheet.id}
                          className="p-2 border rounded-md bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="text-xs text-muted-foreground mb-1">
                            {timesheet.project?.project_name || 'No Project'} -{' '}
                            {timesheet.type}
                          </div>
                          <div className="text-sm font-medium">
                            {timesheet.task?.task_name ||
                              timesheet.note ||
                              'No description'}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  timesheet.status === 'APPROVED'
                                    ? 'default'
                                    : timesheet.status === 'REJECTED'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className="text-xs px-1 py-0"
                              >
                                {timesheet.status}
                              </Badge>
                            </div>

                            <div className="flex gap-0">
                              {!isSubmitted ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => openEditModal(timesheet)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() =>
                                      deleteTimesheetWithConfirmation(timesheet)
                                    }
                                    disabled={isDeleting}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              ) : (
                                <div className="text-xs text-muted-foreground flex items-center">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Locked
                                </div>
                              )}
                            </div>
                          </div>

                          <span className="text-xs font-medium">
                            {formatWorkingHours(timesheet.working_time)}
                          </span>
                        </div>
                      ))}

                      {/* Add new entry button - only show for today and past dates, and when week not submitted */}
                      {isDateAllowedForEntry(day) && !isSubmitted && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-8 text-xs"
                          onClick={() =>
                            openCreateModal(format(day, 'yyyy-MM-dd'))
                          }
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Entry
                        </Button>
                      )}

                      {/* Show locked message when week is submitted */}
                      {isDateAllowedForEntry(day) && isSubmitted && (
                        <div className="w-full h-8 flex items-center justify-center text-xs text-center text-muted-foreground bg-muted/30 rounded border border-dashed">
                          Week {submissionStatus?.toLowerCase() || 'submitted'}{' '}
                          - Editing disabled
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Week Total */}
              <div className="grid grid-cols-8 gap-4 pt-2 border-t">
                <div className="font-medium text-sm">
                  Total ({formatWorkingHours(weekTotal)})
                </div>
                {weekDays.map((day) => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const dayTotal = dailyTotals[dateKey] || 0;

                  return (
                    <div key={day.toISOString()} className="text-center">
                      <span className="font-medium">
                        {dayTotal > 0 ? formatWorkingHours(dayTotal) : '-'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Month View */}
          {viewMode === 'Month' && (
            <MonthlyCalendar
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onDayClick={(date) => {
                // Switch to week view and set date when clicking a day
                setCurrentDate(date);
                setViewMode('Week');
              }}
            />
          )}

          {/* Submit Week Button - Only show in Week view */}
          {viewMode === 'Week' && (
            <div className="flex justify-center mt-6">
              <Button
                className="px-8"
                onClick={submitWeek}
                disabled={isButtonDisabled}
              >
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {buttonText}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Section - Only show in Week view */}
      {viewMode === 'Week' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Summary
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm font-normal">
                  Week: {formatWeekRange(weekDays[0], weekDays[6])}
                </span>
                <span className="text-sm font-normal">Status: Approved</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Weekly Summary */}
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Weekly timesheet summary and analytics
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check-in Punishments Section */}
      <PunishmentsTable
        userId={authState.user?.id}
        defaultFilters={{
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
        }}
      />

      {/* Timesheet Modal */}
      <TimesheetModal />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={confirmDialog.onOpenChange}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
