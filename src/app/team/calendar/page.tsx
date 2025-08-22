'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTeamCalendar } from '@/hooks/timesheet';
import { TeamCalendar } from '@/components/timesheet';
import { TeamCalendarFilters } from './components/team-calendar-filters';
import type {
  TeamCalendarFilters as FiltersType,
  TeamCalendarQuery,
} from '@/types/team-calendar';

export default function TeamCalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL params or defaults
  const [filters, setFilters] = useState<FiltersType>(() => {
    const currentDate = new Date();
    return {
      year: parseInt(
        searchParams.get('year') || currentDate.getFullYear().toString(),
      ),
      month: parseInt(
        searchParams.get('month') || (currentDate.getMonth() + 1).toString(),
      ),
      status: (searchParams.get('status') as any) || 'ALL',
      requestType: (searchParams.get('requestType') as any) || 'ALL',
      projectId: searchParams.get('projectId') || undefined,
      search: searchParams.get('search') || undefined,
    };
  });

  // Build query for the API
  const calendarQuery: TeamCalendarQuery = {
    month: filters.month,
    year: filters.year,
    status: filters.status !== 'ALL' ? filters.status : undefined,
    requestType:
      filters.requestType !== 'ALL' ? filters.requestType : undefined,
    projectId: filters.projectId,
    search: filters.search,
  };

  const { calendarData, isLoading, error, refetch } =
    useTeamCalendar(calendarQuery);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    // Always include year and month
    params.set('year', filters.year.toString());
    params.set('month', filters.month.toString());

    // Include other filters only if they're not default values
    if (filters.status !== 'ALL') {
      params.set('status', filters.status);
    }
    if (filters.requestType !== 'ALL') {
      params.set('requestType', filters.requestType);
    }
    if (filters.projectId) {
      params.set('projectId', filters.projectId);
    }
    if (filters.search?.trim()) {
      params.set('search', filters.search.trim());
    }

    // Update URL without causing a page reload
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl);
  }, [filters, router]);

  const handleFiltersChange = (newFilters: FiltersType) => {
    setFilters(newFilters);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Calendar</h1>
          <p className="text-muted-foreground">
            View and manage team requests across all projects
          </p>
        </div>
      </div>

      {/* Filters */}
      <TeamCalendarFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isLoading={isLoading}
      />

      {/* Calendar Content */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading team calendar...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="text-center py-20">
          <div className="text-destructive space-y-4">
            <h3 className="text-lg font-semibold">
              Failed to load team calendar
            </h3>
            <p className="text-muted-foreground">
              Please check your connection and try again.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {calendarData && !isLoading && (
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <TeamCalendar data={calendarData} />
        </div>
      )}

      {/* Empty State */}
      {calendarData && calendarData.users.length === 0 && !isLoading && (
        <div className="text-center py-20">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-muted-foreground">
              No requests found
            </h3>
            <p className="text-muted-foreground">
              No team requests found for the selected filters. Try adjusting
              your search criteria.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
