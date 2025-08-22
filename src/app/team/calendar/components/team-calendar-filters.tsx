'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Filter } from 'lucide-react';
import { useActiveUserProjects } from '@/hooks/projects/use-user-projects';
import type {
  TeamCalendarFilters,
  RequestStatus,
  RequestType,
} from '@/types/team-calendar';

interface TeamCalendarFiltersProps {
  filters: TeamCalendarFilters;
  onFiltersChange: (filters: TeamCalendarFilters) => void;
  isLoading?: boolean;
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: 'ALL', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

const REQUEST_TYPE_OPTIONS: { value: RequestType; label: string }[] = [
  { value: 'ALL', label: 'All Types' },
  { value: 'OFF', label: 'Off Days' },
  { value: 'REMOTE', label: 'Remote Work' },
  { value: 'ONSITE', label: 'Onsite Work' },
];

// Generate year options (current year ± 5)
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear - 5; year <= currentYear + 5; year++) {
    years.push({ value: year, label: year.toString() });
  }
  return years;
};

export function TeamCalendarFilters({
  filters,
  onFiltersChange,
  isLoading = false,
}: TeamCalendarFiltersProps) {
  const [localFilters, setLocalFilters] =
    useState<TeamCalendarFilters>(filters);
  const { projects, isLoading: projectsLoading } = useActiveUserProjects();
  const yearOptions = generateYearOptions();

  // Sync with external filters
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof TeamCalendarFilters, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters: TeamCalendarFilters = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      status: 'ALL',
      requestType: 'ALL',
      projectId: undefined,
      search: undefined,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <div className="border rounded-lg p-6 mb-6 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold">Team working calendar</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
        {/* Year Filter */}
        <div className="space-y-2">
          <Label htmlFor="year" className="text-sm font-medium">
            Year
          </Label>
          <Select
            value={localFilters.year.toString()}
            onValueChange={(value) =>
              handleFilterChange('year', parseInt(value))
            }
          >
            <SelectTrigger id="year">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year.value} value={year.value.toString()}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Month Filter */}
        <div className="space-y-2">
          <Label htmlFor="month" className="text-sm font-medium">
            Month
          </Label>
          <Select
            value={localFilters.month.toString()}
            onValueChange={(value) =>
              handleFilterChange('month', parseInt(value))
            }
          >
            <SelectTrigger id="month">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.value} - {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium">
            Status
          </Label>
          <Select
            value={localFilters.status}
            onValueChange={(value: RequestStatus) =>
              handleFilterChange('status', value)
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Project Filter */}
        <div className="space-y-2">
          <Label htmlFor="project" className="text-sm font-medium">
            Project
          </Label>
          <Select
            value={localFilters.projectId || 'all'}
            onValueChange={(value) =>
              handleFilterChange(
                'projectId',
                value === 'all' ? undefined : value,
              )
            }
            disabled={projectsLoading}
          >
            <SelectTrigger id="project">
              <SelectValue
                placeholder={projectsLoading ? 'Loading...' : 'Select project'}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{project.project_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {project.project_code}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Request Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="requestType" className="text-sm font-medium">
            Request Type
          </Label>
          <Select
            value={localFilters.requestType}
            onValueChange={(value: RequestType) =>
              handleFilterChange('requestType', value)
            }
          >
            <SelectTrigger id="requestType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {REQUEST_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Actions */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Search Filter - Full Width */}
      <div className="mt-4 space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">
          Search by employee name
        </Label>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            id="search"
            placeholder="Search by name, surname or username..."
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
}
