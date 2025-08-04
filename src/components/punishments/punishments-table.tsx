'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import {
  usePunishments,
  usePunishmentSummary,
  useCreateComplaint,
} from '@/hooks/punishments';
import { PunishmentFilters } from './punishment-filters';
import { ComplaintModal } from './complaint-modal';
import { formatDisplayDate } from '@/lib/date-utils';

interface PunishmentsTableProps {
  userId?: string;
  defaultFilters?: {
    year?: number;
    month?: number;
  };
}

export function PunishmentsTable({
  userId,
  defaultFilters,
}: PunishmentsTableProps) {
  const currentDate = new Date();
  const [filters, setFilters] = useState({
    year: defaultFilters?.year || currentDate.getFullYear(),
    month: defaultFilters?.month || currentDate.getMonth() + 1,
    user_id: userId,
  });

  const [complaintModal, setComplaintModal] = useState<{
    isOpen: boolean;
    timesheetId?: string;
    existingComplaint?: any;
  }>({ isOpen: false });

  const { punishments, pagination, isLoading, error, refetch } =
    usePunishments(filters);

  const { summary, isLoading: summaryLoading } = usePunishmentSummary(
    filters.year,
    filters.month,
    filters.user_id,
  );

  // Format time helper
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '-';
    try {
      // If it's already in HH:mm format, return as is
      if (timeStr.includes(':') && timeStr.length <= 8) {
        return timeStr.slice(0, 5); // Take only HH:mm part
      }
      return timeStr;
    } catch {
      return '-';
    }
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      return formatDisplayDate(new Date(dateStr), 'DD_MM_YYYY');
    } catch {
      return dateStr;
    }
  };

  // Get status badge for violations
  const getStatusBadge = (checkInLate: number, checkOutEarly: number) => {
    const totalViolations = checkInLate + checkOutEarly;
    if (totalViolations === 0) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          0
        </Badge>
      );
    }
    return <Badge variant="destructive">{totalViolations}</Badge>;
  };

  // Get complaint status and button
  const getComplaintInfo = (punishment: any) => {
    const hasComplaints =
      punishment.complaints && punishment.complaints.length > 0;

    if (!hasComplaints) {
      return {
        status: 'none',
        canComplain: true,
        buttonText: 'Complain',
        reply: null,
      };
    }

    const complaint = punishment.complaints[0];
    return {
      status: complaint.complain_reply ? 'replied' : 'pending',
      canComplain: !complaint.complain_reply, // Can edit if no reply yet
      buttonText: complaint.complain_reply ? 'Replied' : 'Edit',
      reply: complaint.complain_reply,
    };
  };

  const handleComplaintClick = (punishment: any) => {
    const complaintInfo = getComplaintInfo(punishment);
    setComplaintModal({
      isOpen: true,
      timesheetId: punishment.id,
      existingComplaint: punishment.complaints?.[0] || null,
    });
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Failed to load punishment data</span>
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Summary and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Check in punishments</CardTitle>
            <div className="flex items-center gap-4 text-sm">
              {summaryLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>
                  Total Punished:{' '}
                  <strong>{summary?.total_punished || 0}</strong>
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <PunishmentFilters
              filters={filters}
              onChange={handleFiltersChange}
            />
            <p className="text-sm">
            Click on the Complain button and enter your complaint if you find anything incorrect.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Punishment Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading punishment data...</span>
            </div>
          ) : punishments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No punishment records found for the selected period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">Date</TableHead>
                    <TableHead className="text-center">
                      Registration Hours
                    </TableHead>
                    <TableHead className="text-center">Checking time</TableHead>
                    <TableHead className="text-center">Result</TableHead>
                    <TableHead className="min-w-[120px]">Edited by</TableHead>
                    <TableHead className="text-center">
                      Punishment Money
                    </TableHead>
                    <TableHead className="min-w-[150px]">Punishment</TableHead>
                    <TableHead className="text-center">Complain</TableHead>
                    <TableHead className="min-w-[100px]">
                      Complain Reply
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead className="text-center text-xs">
                      <div className="flex justify-between">
                        <span>Check in</span>
                        <span>Check out</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center text-xs">
                      <div className="flex justify-between">
                        <span>Check in</span>
                        <span>Check out</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center text-xs">
                      <div className="flex justify-between">
                        <span>Check in late</span>
                        <span>Check out early</span>
                      </div>
                    </TableHead>
                    <TableHead></TableHead>
                    <TableHead></TableHead>
                    <TableHead></TableHead>
                    <TableHead></TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {punishments.map((punishment: any) => {
                    const complaintInfo = getComplaintInfo(punishment);

                    return (
                      <TableRow key={punishment.id}>
                        <TableCell className="font-medium">
                          {formatDate(punishment.date)}
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex justify-between text-sm">
                            <span>{formatTime(punishment.check_in)}</span>
                            <span>{formatTime(punishment.check_out)}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex justify-between text-sm">
                            <span>
                              {formatTime(punishment.actual_check_in)}
                            </span>
                            <span>
                              {formatTime(punishment.actual_check_out)}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex justify-between gap-2">
                            {punishment.check_in_late > 0 ? (
                              <Badge variant="destructive" className="text-xs">
                                {punishment.check_in_late}
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800 text-xs"
                              >
                                0
                              </Badge>
                            )}
                            {punishment.check_out_early > 0 ? (
                              <Badge variant="destructive" className="text-xs">
                                {punishment.check_out_early}
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800 text-xs"
                              >
                                0
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          {punishment.edited_by ? (
                            <span className="text-sm">
                              {punishment.edited_by.name}{' '}
                              {punishment.edited_by.surname}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              -
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-center">
                          {punishment.money > 0 ? (
                            <Badge variant="destructive">
                              {Number(punishment.money).toLocaleString()}đ
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        <TableCell className="text-sm">
                          {punishment.punishment || '-'}
                        </TableCell>

                        <TableCell className="text-center">
                          <Button
                            variant={
                              complaintInfo.status === 'replied'
                                ? 'secondary'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() => handleComplaintClick(punishment)}
                            disabled={
                              !complaintInfo.canComplain &&
                              complaintInfo.status === 'replied'
                            }
                          >
                            {complaintInfo.buttonText}
                          </Button>
                        </TableCell>

                        <TableCell className="text-sm max-w-[200px]">
                          {complaintInfo.reply ? (
                            <div
                              className="truncate"
                              title={complaintInfo.reply}
                            >
                              {complaintInfo.reply}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complaint Modal */}
      <ComplaintModal
        isOpen={complaintModal.isOpen}
        timesheetId={complaintModal.timesheetId}
        existingComplaint={complaintModal.existingComplaint}
        onClose={() => setComplaintModal({ isOpen: false })}
        onSuccess={() => {
          setComplaintModal({ isOpen: false });
          refetch(); // Refresh the table
        }}
      />
    </div>
  );
}
