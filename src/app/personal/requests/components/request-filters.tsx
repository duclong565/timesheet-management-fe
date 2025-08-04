'use client';

import { Calendar, Filter, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  RequestFilters as RequestFiltersType,
  RequestType,
} from '@/types/requests';

interface RequestFiltersProps {
  filters: RequestFiltersType;
  onFiltersChange: (filters: RequestFiltersType) => void;
}

const REQUEST_TYPE_OPTIONS: Array<{
  value: RequestType | 'ALL';
  label: string;
  description: string;
}> = [
  { value: 'ALL', label: 'All Types', description: 'Show all request types' },
  {
    value: 'OFF',
    label: 'Off Requests',
    description: 'Leave and absence requests',
  },
  {
    value: 'REMOTE',
    label: 'Remote Work',
    description: 'Work from home requests',
  },
  {
    value: 'ONSITE',
    label: 'Onsite Work',
    description: 'Client location requests',
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

// Generate year options (current year ± 3 years for better range)
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 3; i <= currentYear + 3; i++) {
    years.push({ value: i, label: i.toString() });
  }
  return years;
};

export function RequestFilters({
  filters,
  onFiltersChange,
}: RequestFiltersProps) {
  const yearOptions = generateYearOptions();

  const handleRequestTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      requestType: value as RequestType | 'ALL',
    });
  };

  const handleYearChange = (value: string) => {
    onFiltersChange({
      ...filters,
      year: parseInt(value, 10),
    });
  };

  const handleMonthChange = (value: string) => {
    onFiltersChange({
      ...filters,
      month: parseInt(value, 10),
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filter Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Request Type Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Request Type
            </Label>
            <Select
              value={filters.requestType}
              onValueChange={handleRequestTypeChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select request type" />
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

          {/* Year Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Year
            </Label>
            <Select
              value={filters.year.toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-full">
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
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Month
            </Label>
            <Select
              value={filters.month.toString()}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-full">
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
        </div>
      </CardContent>
    </Card>
  );
}
