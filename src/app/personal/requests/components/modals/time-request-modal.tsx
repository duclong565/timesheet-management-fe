'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertCircle } from 'lucide-react';
import { BaseRequestModal } from './base-request-modal';
import { useRequestModalStore } from '@/stores/request-modal-store';
import type { CreateRequestDto, TimeType } from '@/types/requests';

// Validation schema
const timeRequestSchema = z
  .object({
    time_type: z.enum(['LATE_ARRIVAL', 'EARLY_DEPARTURE'], {
      required_error: 'Please select a time type',
    }),
    start_time: z
      .string()
      .min(1, 'Start time is required')
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    end_time: z
      .string()
      .min(1, 'End time is required')
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    reason: z.string().min(5, 'Reason must be at least 5 characters'),
    note: z.string().optional(),
  })
  .refine(
    (data) => {
      // Validate time logic based on type
      const start = new Date(`2000-01-01T${data.start_time}`);
      const end = new Date(`2000-01-01T${data.end_time}`);

      if (data.time_type === 'LATE_ARRIVAL') {
        // For late arrival, start_time should be when they arrive (later), end_time is normal end
        return start < end;
      } else {
        // For early departure, start_time is normal start, end_time is when they leave (earlier)
        return start < end;
      }
    },
    {
      message: 'End time must be after start time',
      path: ['end_time'],
    },
  );

type TimeRequestFormData = z.infer<typeof timeRequestSchema>;

const TIME_TYPE_OPTIONS = [
  {
    value: 'LATE_ARRIVAL' as TimeType,
    label: 'Late Arrival',
    description: 'Arriving later than scheduled start time',
    icon: '🕐',
  },
  {
    value: 'EARLY_DEPARTURE' as TimeType,
    label: 'Early Departure',
    description: 'Leaving earlier than scheduled end time',
    icon: '🕐',
  },
];

interface TimeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRequestDto) => Promise<void>;
  isLoading?: boolean;
}

export function TimeRequestModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: TimeRequestModalProps) {
  const {
    activeRequestType,
    activePeriodType,
    selectedDates,
    getModalTitle,
    editingRequest,
    isEditModalOpen,
  } = useRequestModalStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<TimeRequestFormData>({
    resolver: zodResolver(timeRequestSchema),
    mode: 'onChange',
  });

  const timeType = watch('time_type');
  const startTime = watch('start_time');
  const endTime = watch('end_time');

  // Reset form when modal opens/closes or editing changes
  useEffect(() => {
    if (!isOpen) {
      reset();
      return;
    }

    // If editing, populate form with existing data
    if (isEditModalOpen && editingRequest) {
      setValue('time_type', editingRequest.time_type || 'LATE_ARRIVAL');
      setValue('start_time', editingRequest.start_time || '');
      setValue('end_time', editingRequest.end_time || '');
      setValue('reason', editingRequest.reason);
      setValue('note', editingRequest.note || '');
    } else {
      // Set default times based on common work schedule
      setValue('start_time', '09:00');
      setValue('end_time', '17:00');
      reset({
        start_time: '09:00',
        end_time: '17:00',
        time_type: 'LATE_ARRIVAL',
        reason: '',
        note: '',
      });
    }
  }, [isOpen, isEditModalOpen, editingRequest, reset, setValue]);

  const onFormSubmit = async (data: TimeRequestFormData) => {
    if (!activeRequestType || !activePeriodType || selectedDates.length === 0) {
      console.error('Missing required modal state');
      return;
    }

    // Time requests are always single day
    const selectedDate = selectedDates[0];

    const requestData: CreateRequestDto = {
      request_type: 'OFF', // Time requests are treated as OFF requests with specific time
      period_type: 'TIME',
      start_date: selectedDate.toISOString().split('T')[0],
      end_date: selectedDate.toISOString().split('T')[0],
      start_time: data.start_time,
      end_time: data.end_time,
      time_type: data.time_type,
      reason: data.reason,
      note: data.note,
    };

    console.log('⏰ Submitting time request:', requestData);

    try {
      await onSubmit(requestData);
      reset();
    } catch (error) {
      console.error('Failed to submit time request:', error);
    }
  };

  // Calculate time difference
  const calculateTimeDifference = () => {
    if (!startTime || !endTime) return '';

    try {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      const diffMs = Math.abs(end.getTime() - start.getTime());
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (diffHours === 0) {
        return `${diffMinutes} minutes`;
      } else if (diffMinutes === 0) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
      } else {
        return `${diffHours} hour${
          diffHours !== 1 ? 's' : ''
        } ${diffMinutes} minutes`;
      }
    } catch {
      return '';
    }
  };

  const timeDifference = calculateTimeDifference();
  const selectedTimeType = TIME_TYPE_OPTIONS.find(
    (option) => option.value === timeType,
  );

  if (!activeRequestType || !activePeriodType) {
    return null;
  }

  return (
    <BaseRequestModal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      requestType="OFF" // Time requests are OFF requests
      periodType={activePeriodType}
      selectedDates={selectedDates}
      isLoading={isLoading}
      canSubmit={isValid}
      onSubmit={handleSubmit(onFormSubmit)}
      submitText={isEditModalOpen ? 'Update Request' : 'Submit Request'}
      showDeleteButton={isEditModalOpen}
    >
      <form className="space-y-6">
        {/* Time Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="time_type" className="text-sm font-medium">
            Request Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={timeType || ''}
            onValueChange={(value: TimeType) => setValue('time_type', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select request type" />
            </SelectTrigger>
            <SelectContent>
              {TIME_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <span>{option.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-gray-500">
                        {option.description}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.time_type && (
            <p className="text-sm text-red-500">{errors.time_type.message}</p>
          )}
        </div>

        {/* Selected Type Info */}
        {selectedTimeType && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>{selectedTimeType.label}:</strong>{' '}
              {selectedTimeType.description}
            </AlertDescription>
          </Alert>
        )}

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_time" className="text-sm font-medium">
              {timeType === 'LATE_ARRIVAL' ? 'Arrival Time' : 'Normal Start'}{' '}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="start_time"
              type="time"
              {...register('start_time')}
              className="w-full"
            />
            {errors.start_time && (
              <p className="text-sm text-red-500">
                {errors.start_time.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_time" className="text-sm font-medium">
              {timeType === 'EARLY_DEPARTURE' ? 'Departure Time' : 'Normal End'}{' '}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="end_time"
              type="time"
              {...register('end_time')}
              className="w-full"
            />
            {errors.end_time && (
              <p className="text-sm text-red-500">{errors.end_time.message}</p>
            )}
          </div>
        </div>

        {/* Time Difference Display */}
        {timeDifference && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-900">
              <Clock className="h-4 w-4" />
              <span className="font-medium">
                Time Difference: {timeDifference}
              </span>
            </div>
          </div>
        )}

        {/* Validation Warning */}
        {timeType && startTime && endTime && (
          <Alert variant={errors.end_time ? 'destructive' : 'default'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {timeType === 'LATE_ARRIVAL'
                ? `You will arrive at ${startTime} instead of the normal start time.`
                : `You will leave at ${endTime} instead of the normal end time.`}
            </AlertDescription>
          </Alert>
        )}

        {/* Reason Field */}
        <div className="space-y-2">
          <Label htmlFor="reason" className="text-sm font-medium">
            Reason <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reason"
            placeholder="Please provide a detailed reason for your time adjustment..."
            className="min-h-[100px] resize-none"
            {...register('reason')}
          />
          {errors.reason && (
            <p className="text-sm text-red-500">{errors.reason.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Explain why you need to{' '}
            {timeType === 'LATE_ARRIVAL' ? 'arrive late' : 'leave early'}.
          </p>
        </div>

        {/* Note Field */}
        <div className="space-y-2">
          <Label htmlFor="note" className="text-sm font-medium">
            Additional Notes
          </Label>
          <Textarea
            id="note"
            placeholder="Any additional information or special circumstances..."
            className="min-h-[80px] resize-none"
            {...register('note')}
          />
          <p className="text-xs text-gray-500">
            Optional. Any additional context for your manager.
          </p>
        </div>
      </form>
    </BaseRequestModal>
  );
}
