'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import type { Timesheet, Request } from '@/types';

interface TeamTimesheetStatsProps {
  timesheets: Timesheet[];
  requests: Request[];
  filters: {
    year: number;
    month: number;
    status: string;
    request_type: string;
  };
  isLoading: boolean;
}

export function TeamTimesheetStats({
  timesheets,
  requests,
  filters,
  isLoading,
}: TeamTimesheetStatsProps) {
  const stats = useMemo(() => {
    // Calculate timesheet statistics
    const pendingTimesheets = timesheets.filter(
      (t) => t.status === 'PENDING',
    ).length;
    const approvedTimesheets = timesheets.filter(
      (t) => t.status === 'APPROVED',
    ).length;
    const rejectedTimesheets = timesheets.filter(
      (t) => t.status === 'REJECTED',
    ).length;

    // Calculate total working hours for approved timesheets
    const totalHours = timesheets
      .filter((t) => t.status === 'APPROVED')
      .reduce((sum, t) => {
        const hours =
          typeof t.working_time === 'string'
            ? parseFloat(t.working_time)
            : t.working_time;
        return sum + (hours || 0);
      }, 0);

    // Calculate request statistics
    const pendingRequests = requests.filter(
      (r) => r.status === 'PENDING',
    ).length;
    const offRequests = requests.filter((r) => r.request_type === 'OFF').length;
    const remoteRequests = requests.filter(
      (r) => r.request_type === 'REMOTE',
    ).length;
    const onsiteRequests = requests.filter(
      (r) => r.request_type === 'ONSITE',
    ).length;

    // Calculate unique team members
    const uniqueUsers = new Set([
      ...timesheets.map((t) => t.user?.id).filter(Boolean),
      ...requests.map((r) => r.user?.id || r.user_id).filter(Boolean),
    ]);

    return {
      totalHours: totalHours.toFixed(1),
      pendingTimesheets,
      approvedTimesheets,
      rejectedTimesheets,
      totalTimesheets: timesheets.length,
      pendingRequests,
      offRequests,
      remoteRequests,
      onsiteRequests,
      totalRequests: requests.length,
      activeTeamMembers: uniqueUsers.size,
    };
  }, [timesheets, requests]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Hours */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalHours}h</div>
          <p className="text-xs text-muted-foreground">
            Approved working hours this month
          </p>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Team</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeTeamMembers}</div>
          <p className="text-xs text-muted-foreground">
            Members with activity this month
          </p>
        </CardContent>
      </Card>

      {/* Timesheet Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Timesheets</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTimesheets}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              {stats.approvedTimesheets}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              {stats.pendingTimesheets}
            </Badge>
            {stats.rejectedTimesheets > 0 && (
              <Badge variant="destructive" className="text-xs">
                <XCircle className="h-3 w-3 mr-1" />
                {stats.rejectedTimesheets}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Requests Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Requests</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRequests}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="destructive" className="text-xs">
              Off: {stats.offRequests}
            </Badge>
            <Badge variant="default" className="text-xs">
              Remote: {stats.remoteRequests}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Onsite: {stats.onsiteRequests}
            </Badge>
          </div>
          {stats.pendingRequests > 0 && (
            <p className="text-xs text-orange-600 mt-1">
              {stats.pendingRequests} pending approval
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
