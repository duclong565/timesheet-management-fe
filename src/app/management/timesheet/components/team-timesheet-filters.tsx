'use client';

import { Calendar, Filter, Clock, Users, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface TeamTimesheetFiltersProps {
  filters: {
    year: number;
    month: number;
    status: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
    project_id?: string;
    request_type: 'ALL' | 'TIMESHEET' | 'OFF' | 'REMOTE' | 'ONSITE';
    user_id?: string;
  };
  onFiltersChange: (filters: any) => void;
  selectedTeamMembers: string[];
  onTeamMemberToggle: (userId: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Status', description: 'Show all statuses' },
  { value: 'PENDING', label: 'Pending', description: 'Awaiting approval' },
  { value: 'APPROVED', label: 'Approved', description: 'Approved entries' },
  { value: 'REJECTED', label: 'Rejected', description: 'Rejected entries' },
];

const REQUEST_TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Types', description: 'Show all types' },
  {
    value: 'TIMESHEET',
    label: 'Timesheets',
    description: 'Working hours entries',
  },
  { value: 'OFF', label: 'Off Requests', description: 'Leave and absence' },
  { value: 'REMOTE', label: 'Remote Work', description: 'Work from home' },
  {
    value: 'ONSITE',
    label: 'Onsite Work',
    description: 'Client location work',
  },
];

const MONTH_OPTIONS = [
  { value: 1, label: 'January', short: 'Jan' },
  { value: 2, label: 'February', short: 'Feb' },
  { value: 3, label: 'March', short: 'Mar' },
  { value: 4, label: 'April', short: 'Apr' },
  { value: 5, label: 'May', short: 'May' },
  { value: 6, label: 'June', short: 'Jun' },
  { value: 7, label: 'July', short: 'Jul' },
  { value: 8, label: 'August', short: 'Aug' },
  { value: 9, label: 'September', short: 'Sep' },
  { value: 10, label: 'October', short: 'Oct' },
  { value: 11, label: 'November', short: 'Nov' },
  { value: 12, label: 'December', short: 'Dec' },
];

// Generate year options (current year ± 3 years)
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 3; i <= currentYear + 3; i++) {
    years.push({ value: i, label: i.toString() });
  }
  return years;
};

export function TeamTimesheetFilters({
  filters,
  onFiltersChange,
  selectedTeamMembers,
  onTeamMemberToggle,
}: TeamTimesheetFiltersProps) {
  const yearOptions = generateYearOptions();

  // Fetch projects for the dropdown
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects({ limit: 100 }),
  });

  // Fetch team members
  const { data: usersData } = useQuery({
    queryKey: ['team-users'],
    queryFn: () => apiClient.getUsers({ limit: 100, is_active: true }),
  });

  const projects = projectsData?.data || [];
  const teamMembers = usersData?.data || [];

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      status: value as typeof filters.status,
    });
  };

  const handleYearChange = (value: string) => {
    onFiltersChange({
      year: parseInt(value, 10),
    });
  };

  const handleMonthChange = (value: string) => {
    onFiltersChange({
      month: parseInt(value, 10),
    });
  };

  const handleProjectChange = (value: string) => {
    onFiltersChange({
      project_id: value === 'ALL' ? undefined : value,
    });
  };

  const handleRequestTypeChange = (value: string) => {
    onFiltersChange({
      request_type: value as typeof filters.request_type,
    });
  };

  const clearTeamSelection = () => {
    teamMembers.forEach((member) => {
      if (selectedTeamMembers.includes(member.id)) {
        onTeamMemberToggle(member.id);
      }
    });
  };

  const selectAllTeam = () => {
    teamMembers.forEach((member) => {
      if (!selectedTeamMembers.includes(member.id)) {
        onTeamMemberToggle(member.id);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filter Team Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Year Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Year
              </Label>
              <Select
                value={filters.year.toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Month
              </Label>
              <Select
                value={filters.month.toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {option.short}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Status
              </Label>
              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Project
              </Label>
              <Select
                value={filters.project_id || 'ALL'}
                onValueChange={handleProjectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {project.project_name}
                        </span>
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
              <Label className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Type
              </Label>
              <Select
                value={filters.request_type}
                onValueChange={handleRequestTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Member Selection */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Team Members
              {selectedTeamMembers.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedTeamMembers.length} selected
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllTeam}
                disabled={selectedTeamMembers.length === teamMembers.length}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearTeamSelection}
                disabled={selectedTeamMembers.length === 0}
              >
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {teamMembers.map((member) => {
              const isSelected = selectedTeamMembers.includes(member.id);
              return (
                <Badge
                  key={member.id}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => onTeamMemberToggle(member.id)}
                >
                  {member.name} {member.surname}
                  {typeof member.role === 'object' &&
                    member.role?.role_name && (
                      <span className="ml-1 text-xs opacity-70">
                        ({member.role.role_name})
                      </span>
                    )}
                </Badge>
              );
            })}
            {teamMembers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No team members found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
