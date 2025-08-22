'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Loader2, MapPin, Building } from 'lucide-react';
import { BaseRequestModal } from './base-request-modal';
import { useRequestModalStore } from '@/stores/request-modal-store';
import { useActiveUserProjects } from '@/hooks/projects/use-user-projects';
import type { CreateRequestDto } from '@/types/requests';

// Validation schema
const onsiteRequestSchema = z.object({
  project_id: z.string().min(1, 'Please select a project for onsite work'),
  location: z.string().min(2, 'Please specify the onsite location'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  note: z.string().optional(),
});

type OnsiteRequestFormData = z.infer<typeof onsiteRequestSchema>;

interface OnsiteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRequestDto) => Promise<void>;
  isLoading?: boolean;
}

export function OnsiteRequestModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: OnsiteRequestModalProps) {
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
  } = useForm<OnsiteRequestFormData>({
    resolver: zodResolver(onsiteRequestSchema),
    mode: 'onChange',
  });

  const selectedProjectId = watch('project_id');
  const location = watch('location');

  // Reset form when modal opens/closes or editing changes
  useEffect(() => {
    if (!isOpen) {
      reset();
      return;
    }

    // If editing, populate form with existing data
    if (isEditModalOpen && editingRequest) {
      setValue('project_id', editingRequest.project_id || '');
      setValue('location', editingRequest.location || '');
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

  const onFormSubmit = async (data: OnsiteRequestFormData) => {
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
      project_id: data.project_id,
      location: data.location,
      reason: data.reason,
      note: data.note,
    };

    console.log('🏢 Submitting onsite work request:', requestData);

    try {
      await onSubmit(requestData);
      reset();
    } catch (error) {
      console.error('Failed to submit onsite work request:', error);
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
          <Building className="h-5 w-5" />
          <AlertDescription className="font-medium">
            You are requesting to work{' '}
            <strong className="font-bold">onsite</strong> for{' '}
            <strong className="font-bold">
              {totalDays} day{totalDays !== 1 ? 's' : ''}
            </strong>
            {activePeriodType !== 'FULL_DAY' &&
              ` (${activePeriodType.toLowerCase()})`}
            .
          </AlertDescription>
        </Alert>

        {/* Project Selection (Required) */}
        <div className="space-y-2">
          <Label htmlFor="project_id" className="text-sm font-medium">
            Project <span className="text-red-500">*</span>
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
              onValueChange={(value) => setValue('project_id', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select project for onsite work" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {project.project_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {project.project_code}
                        {project.client && ` • ${project.client.client_name}`}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.project_id && (
            <p className="text-sm text-red-500">{errors.project_id.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Select the project that requires onsite work.
          </p>
        </div>

        {/* Selected Project Info */}
        {selectedProject && (
          <Alert variant="info" className="bg-green-50 border-green-200">
            <h4 className="font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Onsite work for: {selectedProject.project_name}
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
                {selectedProject.project_type && (
                  <div>
                    <strong>Type:</strong> {selectedProject.project_type}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Location Field */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">
            Onsite Location <span className="text-red-500">*</span>
          </Label>
          <Input
            id="location"
            placeholder="e.g., Client Office, 123 Main St, City"
            className="w-full"
            {...register('location')}
          />
          {errors.location && (
            <p className="text-sm text-red-500">{errors.location.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Specify the exact location where you'll be working onsite.
          </p>
        </div>

        {/* Location Info */}
        {location && location.length >= 2 && (
          <Alert variant="info" className="bg-green-50 border-green-200">
            <MapPin className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Onsite Location:</strong> {location}
            </AlertDescription>
          </Alert>
        )}

        {/* Onsite Work Guidelines */}
        <Alert variant="info" className="bg-green-50 border-green-200">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="font-medium mb-2">Onsite Work Guidelines:</div>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>Confirm client availability and access requirements</li>
              <li>Bring necessary equipment and materials</li>
              <li>Follow client security and safety protocols</li>
              <li>Keep travel receipts for expense reimbursement</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Reason Field */}
        <div className="space-y-2">
          <Label htmlFor="reason" className="text-sm font-medium">
            Reason <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reason"
            placeholder="Please provide a detailed reason for onsite work..."
            className="min-h-[100px] resize-none"
            {...register('reason')}
          />
          {errors.reason && (
            <p className="text-sm text-red-500">{errors.reason.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Minimum 5 characters. Explain why onsite work is required.
          </p>
        </div>

        {/* Note Field */}
        <div className="space-y-2">
          <Label htmlFor="note" className="text-sm font-medium">
            Additional Notes
          </Label>
          <Textarea
            id="note"
            placeholder="Any additional information about the onsite work..."
            className="min-h-[80px] resize-none"
            {...register('note')}
          />
          <p className="text-xs text-gray-500">
            Optional. Include travel details, special requirements, or other
            relevant information.
          </p>
        </div>
      </form>
    </BaseRequestModal>
  );
}
