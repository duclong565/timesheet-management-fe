'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { RequestType, PeriodType } from '@/types/requests';

interface BaseRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  requestType: RequestType;
  periodType: PeriodType;
  selectedDates: Date[];
  children: React.ReactNode;
  isLoading?: boolean;
  canSubmit?: boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitText?: string;
  showDeleteButton?: boolean;
  onDelete?: () => void;
}

const REQUEST_TYPE_COLORS = {
  OFF: {
    bg: 'bg-red-500',
    text: 'text-white',
    border: 'border-red-200',
    bgLight: 'bg-red-50',
  },
  REMOTE: {
    bg: 'bg-blue-500',
    text: 'text-white',
    border: 'border-blue-200',
    bgLight: 'bg-blue-50',
  },
  ONSITE: {
    bg: 'bg-green-500',
    text: 'text-white',
    border: 'border-green-200',
    bgLight: 'bg-green-50',
  },
};

const PERIOD_LABELS = {
  FULL_DAY: 'Full Day',
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  TIME: 'Time',
};

export function BaseRequestModal({
  isOpen,
  onClose,
  title,
  requestType,
  periodType,
  selectedDates,
  children,
  isLoading = false,
  canSubmit = true,
  onSubmit,
  onCancel,
  submitText = 'Submit Request',
  showDeleteButton = false,
  onDelete,
}: BaseRequestModalProps) {
  const colors = REQUEST_TYPE_COLORS[requestType];

  // Format date range
  const dateRange = (() => {
    if (selectedDates.length === 0) return '';
    if (selectedDates.length === 1) {
      return format(selectedDates[0], 'MMM dd, yyyy');
    }

    const sortedDates = [...selectedDates].sort(
      (a, b) => a.getTime() - b.getTime(),
    );
    const start = format(sortedDates[0], 'MMM dd');
    const end = format(sortedDates[sortedDates.length - 1], 'MMM dd, yyyy');

    return `${start} - ${end}`;
  })();

  const handleSubmit = () => {
    if (onSubmit && canSubmit && !isLoading) {
      onSubmit();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className={cn('p-6', colors.border, colors.bgLight)}>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {title}
              </DialogTitle>
              <div className="flex items-center gap-4">
                <Badge className={cn('px-3 py-1 text-sm', colors.bg, colors.text)}>
                  {requestType === 'OFF'
                    ? 'Off Request'
                    : requestType === 'REMOTE'
                    ? 'Remote Work'
                    : 'Onsite Work'}
                </Badge>

                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  {periodType === 'TIME' ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <Calendar className="h-4 w-4" />
                  )}
                  <span>{PERIOD_LABELS[periodType]}</span>
                </div>

                {dateRange && (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{dateRange}</span>
                    {selectedDates.length > 1 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {selectedDates.length} days
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 shrink-0 rounded-full"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Modal Footer */}
        <div className="border-t pt-4 flex items-center justify-between">
          <div className="flex gap-2">
            {showDeleteButton && (
              <Button
                variant="destructive"
                onClick={onDelete}
                disabled={isLoading}
                className="px-6"
              >
                Delete
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-6"
            >
              Cancel
            </Button>

            {onSubmit && (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isLoading}
                className={cn('px-6', colors.bg)}
              >
                {isLoading ? 'Submitting...' : submitText}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
