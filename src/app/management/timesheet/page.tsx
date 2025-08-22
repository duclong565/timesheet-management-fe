'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { TeamTimesheetFilters } from './components/team-timesheet-filters';
import { TeamTimesheetCalendar } from './components/team-timesheet-calendar';
import { TeamTimesheetStats } from './components/team-timesheet-stats';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';
import type { TimesheetQuery } from '@/types';

interface TeamTimesheetFilters {
  year: number;
  month: number;
  status: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
  project_id?: string;
  request_type: 'ALL' | 'TIMESHEET' | 'OFF' | 'REMOTE' | 'ONSITE';
  user_id?: string;
}

export default function TeamTimesheetPage() {
  const { authState } = useAuth();
  const [filters, setFilters] = useState<TeamTimesheetFilters>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    status: 'ALL',
    request_type: 'ALL',
  });

  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

  // Fetch team timesheets based on current filters
  const { data: timesheetsData, isLoading: timesheetsLoading } = useQuery({
    queryKey: ['team-timesheets', filters],
    queryFn: () => {
      const query: TimesheetQuery = {
        start_date: `${filters.year}-${filters.month
          .toString()
          .padStart(2, '0')}-01`,
        end_date: `${filters.year}-${filters.month
          .toString()
          .padStart(2, '0')}-31`,
        status: filters.status !== 'ALL' ? filters.status : undefined,
        project_id: filters.project_id,
        page: 1,
        limit: 1000, // Get all entries for the month
      };
      return apiClient.getTimesheets(query);
    },
    enabled: !!authState.isAuthenticated,
  });

  // Fetch team requests for the calendar
  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['team-requests', filters],
    queryFn: () => {
      const startDate = `${filters.year}-${filters.month
        .toString()
        .padStart(2, '0')}-01`;
      const endDate = `${filters.year}-${filters.month
        .toString()
        .padStart(2, '0')}-31`;

      return apiClient.getRequests({
        startDate,
        endDate,
        page: 1,
        limit: 1000,
      });
    },
    enabled: !!authState.isAuthenticated,
  });

  // Fetch team calendar data
  const { data: teamCalendarData, isLoading: calendarLoading } = useQuery({
    queryKey: ['team-calendar', filters.year, filters.month],
    queryFn: () =>
      apiClient.getTeamCalendar({
        year: filters.year,
        month: filters.month,
        projectId: filters.project_id,
      }),
    enabled: !!authState.isAuthenticated,
  });

  const timesheets = timesheetsData?.data || [];
  const requests = requestsData?.data || [];
  const isLoading = timesheetsLoading || requestsLoading || calendarLoading;

  // Handle filter changes
  const handleFiltersChange = (newFilters: Partial<TeamTimesheetFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Handle team member selection
  const handleTeamMemberToggle = (userId: string) => {
    setSelectedTeamMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Working Calendar</h1>
          <p className="text-muted-foreground">
            Monitor team member timesheets, requests, and working schedules
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Team Statistics */}
      <TeamTimesheetStats
        timesheets={timesheets}
        requests={requests}
        filters={filters}
        isLoading={isLoading}
      />

      {/* Filter Section */}
      <TeamTimesheetFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        selectedTeamMembers={selectedTeamMembers}
        onTeamMemberToggle={handleTeamMemberToggle}
      />

      {/* Calendar Section */}
      <TeamTimesheetCalendar
        filters={filters}
        timesheets={timesheets}
        requests={requests}
        teamCalendarData={teamCalendarData?.data}
        selectedTeamMembers={selectedTeamMembers}
        isLoading={isLoading}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  );
}
