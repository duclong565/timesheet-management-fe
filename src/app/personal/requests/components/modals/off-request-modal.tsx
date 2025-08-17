'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Loader2 } from 'lucide-react';
import { BaseRequestModal } from './base-request-modal';
import { useRequestModalStore } from '@/stores/request-modal-store';
import type { CreateRequestDto, AbsenceType } from '@/types/requests';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Validation schema
const offRequestSchema = z.object({
  absence_type_id: z.string().min(1, 'Please select an absence type'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  note: z.string().optional(),
});

type OffRequestFormData = z.infer<typeof offRequestSchema>;

interface OffRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRequestDto) => Promise<void>;
  isLoading?: boolean;
}

export function OffRequestModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: OffRequestModalProps) {
  const {
    activeRequestType,
    activePeriodType,
    selectedDates,
    getModalTitle,
    editingRequest,
    isEditModalOpen,
  } = useRequestModalStore();

  const { data: absenceTypesData, isLoading: isLoadingAbsenceTypes } = useQuery({
    queryKey: ['absence-types'],
    queryFn: () => apiClient.getAbsenceTypes(),
  });

  const absenceTypes = absenceTypesData?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<OffRequestFormData>({
    resolver: zodResolver(offRequestSchema),
    mode: 'onChange',
  });

  const selectedAbsenceTypeId = watch('absence_type_id');

  // Reset form when modal opens/closes or editing changes
  useEffect(() => {
    if (!isOpen) {
      reset();
      return;
    }

    // If editing, populate form with existing data
    if (isEditModalOpen && editingRequest) {
      setValue('absence_type_id', editingRequest.absence_type_id || '');
      setValue('reason', editingRequest.reason);
      setValue('note', editingRequest.note || '');
    } else {
      reset();
    }
  }, [isOpen, isEditModalOpen, editingRequest, reset, setValue]);

  // Get selected absence type details
  const selectedAbsenceType = absenceTypes.find(
    (type) => type.id === selectedAbsenceTypeId,
  );

  const onFormSubmit = async (data: OffRequestFormData) => {
    if (!activeRequestType || !activePeriodType || selectedDates.length === 0) {
      console.error('Missing required modal state');
      return;
    }

    const sortedDates = [...selectedDates].sort(
      (a, b) => a.getTime() - b.getTime(),
    );
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];

    const requestData: CreateRequestDto = {
      request_type: activeRequestType,
      period_type: activePeriodType,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      absence_type_id: data.absence_type_id,
      reason: data.reason,
      note: data.note,
    };

    console.log('📋 Submitting off request:', requestData);

    try {
      await onSubmit(requestData);
      reset();
    } catch (error) {
      console.error('Failed to submit off request:', error);
    }
  };

  const calculateTotalDays = () => {
    if (selectedDates.length === 0) return 0;

    // For multi-date selections, count total days
    if (selectedDates.length > 1) {
      return selectedDates.length;
    }

    // For single date, check period type
    switch (activePeriodType) {
      case 'FULL_DAY':
        return 1;
      case 'MORNING':
      case 'AFTERNOON':
        return 0.5;
      default:
        return 1;
    }
  };

  const totalDays = calculateTotalDays();

  if (!activeRequestType || !activePeriodType) {
    return null;
  }

  return (
    <BaseRequestModal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      requestType={activeRequestType}
      periodType={activePeriodType}
      selectedDates={selectedDates}
      isLoading={isLoading || isLoadingAbsenceTypes}
      canSubmit={isValid && !isLoadingAbsenceTypes}
      onSubmit={handleSubmit(onFormSubmit)}
      submitText={isEditModalOpen ? 'Update Request' : 'Submit Request'}
      showDeleteButton={isEditModalOpen}
    >
      <form className="space-y-6">
        {/* Days Summary */}
        <Alert>
          <Info className="h-5 w-5" />
          <AlertDescription className="font-medium">
            You are requesting{' '}
            <strong className="font-bold">
              {totalDays} day{totalDays !== 1 ? 's' : ''}
            </strong>{' '}
            off
            {activePeriodType !== 'FULL_DAY' &&
              ` (${activePeriodType.toLowerCase()})`}
            .
          </AlertDescription>
        </Alert>

        {/* Absence Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="absence_type_id" className="text-sm font-medium">
            Absence Type <span className="text-red-500">*</span>
          </Label>
          {isLoadingAbsenceTypes ? (
            <div className="flex items-center justify-center h-10">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Loading absence types...</span>
            </div>
          ) : (
            <Select
              value={selectedAbsenceTypeId || ''}
              onValueChange={(value) => setValue('absence_type_id', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select absence type" />
              </SelectTrigger>
              <SelectContent>
                {absenceTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{type.name}</span>
                      {type.description && (
                        <span className="text-xs text-muted-foreground">
                          {type.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.absence_type_id && (
            <p className="text-sm text-red-500">
              {errors.absence_type_id.message}
            </p>
          )}
        </div>

        {/* Selected Absence Type Info */}
        {selectedAbsenceType && (
          <Alert variant="info">
            <h4 className="font-medium">
              {selectedAbsenceType.name}
            </h4>
            <AlertDescription className="text-sm mt-1">
              {selectedAbsenceType.description}
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
            placeholder="Please provide a detailed reason for your request..."
            className="min-h-[100px] resize-none"
            {...register('reason')}
          />
          {errors.reason && (
            <p className="text-sm text-red-500">{errors.reason.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Minimum 5 characters. Be specific about your request.
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
