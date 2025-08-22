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
import { Info, Loader2, Wifi } from 'lucide-react';
import { BaseRequestModal } from './base-request-modal';
import { useRequestModalStore } from '@/stores/request-modal-store';
import { useActiveUserProjects } from '@/hooks/projects/use-user-projects';
import type { CreateRequestDto } from '@/types/requests';

// Validation schema
const remoteRequestSchema = z.object({
  project_id: z.string().optional(), // Optional for remote work
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  note: z.string().optional(),
});

type RemoteRequestFormData = z.infer<typeof remoteRequestSchema>;

interface RemoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRequestDto) => Promise<void>;
  isLoading?: boolean;
}

export function RemoteRequestModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: RemoteRequestModalProps) {
  const {
    activeRequestType,
    activePeriodType,
    selectedDates,
    getModalTitle,
    editingRequest,
    isEditModalOpen,
  } = useRequestModalStore();

  const { projects, isLoading: isLoadingProjects } = useActiveUserProjects();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<RemoteRequestFormData>({
    resolver: zodResolver(remoteRequestSchema),
    mode: 'onChange',
  });

  const selectedProjectId = watch('project_id');

  // Reset form when modal opens/closes or editing changes
  useEffect(() => {
    if (!isOpen) {
      reset();
      return;
    }

    // If editing, populate form with existing data
    if (isEditModalOpen && editingRequest) {
      setValue('project_id', editingRequest.project_id || '');
      setValue('reason', editingRequest.reason);
      setValue('note', editingRequest.note || '');
    } else {
      reset();
    }
  }, [isOpen, isEditModalOpen, editingRequest, reset, setValue]);

  // Get selected project details
  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );

  const onFormSubmit = async (data: RemoteRequestFormData) => {
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
      project_id: data.project_id || undefined,
      reason: data.reason,
      note: data.note,
    };

    console.log('💻 Submitting remote work request:', requestData);

    try {
      await onSubmit(requestData);
      reset();
    } catch (error) {
      console.error('Failed to submit remote work request:', error);
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
      isLoading={isLoading || isLoadingProjects}
      canSubmit={isValid && !isLoadingProjects}
      onSubmit={handleSubmit(onFormSubmit)}
      submitText={isEditModalOpen ? 'Update Request' : 'Submit Request'}
      showDeleteButton={isEditModalOpen}
    >
      <form className="space-y-6">
        {/* Days Summary */}
        <Alert>
          <Wifi className="h-5 w-5" />
          <AlertDescription className="font-medium">
            You are requesting to work{' '}
            <strong className="font-bold">remotely</strong> for{' '}
            <strong className="font-bold">
              {totalDays} day{totalDays !== 1 ? 's' : ''}
            </strong>
            {activePeriodType !== 'FULL_DAY' &&
              ` (${activePeriodType.toLowerCase()})`}
            .
          </AlertDescription>
        </Alert>

        {/* Project Selection (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="project_id" className="text-sm font-medium">
            Project{' '}
            <span className="text-gray-500 font-normal">(Optional)</span>
          </Label>
          {isLoadingProjects ? (
            <div className="flex items-center justify-center h-10">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading projects...
              </span>
            </div>
          ) : (
            <Select
              value={selectedProjectId || ''}
              onValueChange={(value) =>
                setValue('project_id', value || undefined)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select project (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  <span className="text-gray-500">General remote work</span>
                </SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex flex-col">
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
          )}
          <p className="text-xs text-gray-500">
            Specify if you're working remotely on a specific project.
          </p>
        </div>

        {/* Selected Project Info */}
        {selectedProject && (
          <Alert variant="info" className="bg-blue-50 border-blue-200">
            <h4 className="font-medium flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Remote work on: {selectedProject.project_name}
            </h4>
            <AlertDescription className="text-sm mt-1">
              <div className="space-y-1">
                <div>
                  <strong>Project Code:</strong> {selectedProject.project_code}
                </div>
                {selectedProject.client && (
                  <div>
                    <strong>Client:</strong>{' '}
                    {selectedProject.client.client_name}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Remote Work Guidelines */}
        {!selectedProject && (
          <Alert variant="info" className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <div className="font-medium mb-2">Remote Work Guidelines:</div>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>Ensure stable internet connection and quiet workspace</li>
                <li>Maintain regular communication with your team</li>
                <li>Follow company remote work policies</li>
                <li>Be available during core business hours</li>
              </ul>
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
            placeholder="Please provide a detailed reason for working remotely..."
            className="min-h-[100px] resize-none"
            {...register('reason')}
          />
          {errors.reason && (
            <p className="text-sm text-red-500">{errors.reason.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Minimum 5 characters. Explain why remote work is needed.
          </p>
        </div>

        {/* Note Field */}
        <div className="space-y-2">
          <Label htmlFor="note" className="text-sm font-medium">
            Additional Notes
          </Label>
          <Textarea
            id="note"
            placeholder="Any additional information about your remote work setup..."
            className="min-h-[80px] resize-none"
            {...register('note')}
          />
          <p className="text-xs text-gray-500">
            Optional. Include details about your remote workspace or special
            considerations.
          </p>
        </div>
      </form>
    </BaseRequestModal>
  );
}
