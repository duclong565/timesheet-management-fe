'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  timesheetFormSchemaWithCrossValidation,
  TimesheetFormData,
  convertFormDataToApiFormat,
} from '@/lib/validations/timesheet';
import { useActiveUserProjects } from '@/hooks/projects/use-user-projects';
import { useTimesheetTasks } from '@/hooks/tasks/use-tasks';
import { useTimesheetCreateWithValidation } from '@/hooks/timesheet/use-timesheet-create';
import { useTimesheetUpdateWithValidation } from '@/hooks/timesheet/use-timesheet-update';
import { useTimesheetModalStore } from '@/stores/timesheet-modal-store';

interface TimesheetFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TimesheetForm({ onSuccess, onCancel }: TimesheetFormProps) {
  const { mode, formData, editingTimesheet } = useTimesheetModalStore();
  const { projects, isLoading: projectsLoading } = useActiveUserProjects();

  // Initialize form with React Hook Form
  const form = useForm<TimesheetFormData>({
    resolver: zodResolver(timesheetFormSchemaWithCrossValidation),
    defaultValues: formData as TimesheetFormData,
    mode: 'onChange', // Real-time validation
  });

  const selectedProjectId = form.watch('projectId');
  const { tasks, isLoading: tasksLoading } =
    useTimesheetTasks(selectedProjectId);

  const { createTimesheetWithValidation, isCreating } =
    useTimesheetCreateWithValidation();

  const { updateTimesheetWithValidation, isUpdating } =
    useTimesheetUpdateWithValidation();

  // Determine if we're in a loading state
  const isSubmitting = isCreating || isUpdating;

  // Update form when store data changes
  useEffect(() => {
    if (formData) {
      form.reset(formData as TimesheetFormData);
    }
  }, [formData, form]);

  // Clear task selection when project changes
  useEffect(() => {
    if (selectedProjectId !== formData.projectId) {
      form.setValue('taskId', '');
    }
  }, [selectedProjectId, formData.projectId, form]);

  const onSubmit = async (data: TimesheetFormData) => {
    try {
      if (mode === 'create') {
        const apiData = convertFormDataToApiFormat(data);
        await createTimesheetWithValidation(apiData);
      } else if (mode === 'edit' && editingTimesheet) {
        // For edit mode, convert data to update format
        const updateData = {
          id: editingTimesheet.id,
          date: data.date,
          working_time: data.workingTime,
          type: data.type,
          note: data.note || '',
          project_id: data.projectId || undefined,
          task_id: data.taskId || undefined,
        };

        await updateTimesheetWithValidation(updateData);
      } else {
        console.error('Edit mode requires editingTimesheet data');
        return;
      }

      onSuccess?.();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Date Field */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), 'dd/MM/yyyy')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select the date for this timesheet entry
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Working Time Field */}
        <FormField
          control={form.control}
          name="workingTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Working Hours</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  placeholder="8.0"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseFloat(e.target.value) || 0)
                  }
                />
              </FormControl>
              <FormDescription>
                Enter hours in 30-minute increments (0.5, 1.0, 1.5, etc.)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type Field */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timesheet type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal Hours</SelectItem>
                  <SelectItem value="OVERTIME">Overtime</SelectItem>
                  <SelectItem value="HOLIDAY">Holiday Work</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select the type of working hours
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Project Field */}
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project (Optional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projectsLoading ? (
                    <div className="p-2 text-sm text-muted-foreground flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading projects...
                    </div>
                  ) : (
                    projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.project_name} ({project.project_code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Optional: Choose the project this time was spent on
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Task Field */}
        <FormField
          control={form.control}
          name="taskId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task (Optional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedProjectId || tasksLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tasksLoading ? (
                    <div className="p-2 text-sm text-muted-foreground flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading tasks...
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.task_name}
                        {task.is_billable && (
                          <span className="text-green-600"> (Billable)</span>
                        )}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Optional: Choose the specific task (only available when project
                is selected)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Note Field */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional details about this work..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Additional details about the work performed (
                {field.value?.length || 0}/500)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Create Timesheet' : 'Update Timesheet'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
