import { z } from 'zod';

export const timesheetFormSchema = z.object({
  date: z
    .string()
    .min(1, 'Date is required')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      // Allow dates up to today (no future dates)
      return selectedDate <= today;
    }, 'Cannot create timesheet for future dates')
    .refine((date) => {
      const selectedDate = new Date(date);
      return !isNaN(selectedDate.getTime());
    }, 'Invalid date format'),

  workingTime: z
    .number()
    .min(0.1, 'Working time must be at least 0.1 hours')
    .max(24, 'Working time cannot exceed 24 hours per day')
    .refine((time) => {
      // Allow increments of 0.5 hours (30 minutes)
      return time % 0.5 === 0;
    }, 'Working time must be in 30-minute increments (0.5, 1.0, 1.5, etc.)'),

  type: z.enum(['NORMAL', 'OVERTIME', 'HOLIDAY']),

  note: z.string().max(500, 'Note cannot exceed 500 characters').optional(),

  projectId: z
    .string()
    .optional()
    .refine((val) => {
      // If provided, must be a valid UUID
      if (val && val.length > 0) {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(val);
      }
      return true;
    }, 'Invalid project ID format'),

  taskId: z
    .string()
    .optional()
    .refine((val) => {
      // If provided, must be a valid UUID
      if (val && val.length > 0) {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(val);
      }
      return true;
    }, 'Invalid task ID format'),
});

// Refine the schema to add cross-field validation
export const timesheetFormSchemaWithCrossValidation =
  timesheetFormSchema.refine(
    (data) => {
      // If task is selected, project must also be selected
      if (
        data.taskId &&
        data.taskId.length > 0 &&
        (!data.projectId || data.projectId.length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Project must be selected when task is specified',
      path: ['projectId'], // This will show the error on the project field
    },
  );

export type TimesheetFormData = z.infer<typeof timesheetFormSchema>;

// Helper function to get default form values
export function getDefaultTimesheetFormValues(
  date?: string,
): TimesheetFormData {
  const today = new Date().toISOString().split('T')[0];

  return {
    date: date || today,
    workingTime: 8,
    type: 'NORMAL',
    note: '',
    projectId: '',
    taskId: '',
  };
}

// Helper function to convert form data to API format
export function convertFormDataToApiFormat(formData: TimesheetFormData) {
  return {
    date: formData.date,
    workingTime: formData.workingTime,
    type: formData.type,
    note: formData.note || undefined,
    projectId: formData.projectId || undefined,
    taskId: formData.taskId || undefined,
  };
}
