'use client';

import { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import type { Task } from '@/types';

const taskFormSchema = z.object({
  task_name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  is_billable: z.boolean().default(false),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  task?: Task;
  onSubmit: (values: TaskFormValues) => void;
  isSubmitting?: boolean;
}

export function TaskForm({ task, onSubmit, isSubmitting }: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      task_name: task?.task_name ?? '',
      description: task?.description ?? '',
      is_billable: task?.is_billable ?? false,
    },
  });

  useEffect(() => {
    form.reset({
      task_name: task?.task_name ?? '',
      description: task?.description ?? '',
      is_billable: task?.is_billable ?? false,
    });
  }, [task, form]);

  const handleSubmit = (values: TaskFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="task_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_billable"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billable</FormLabel>
              <Select
                value={field.value ? 'true' : 'false'}
                onValueChange={(val) => field.onChange(val === 'true')}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Billable</SelectItem>
                  <SelectItem value="false">Non-billable</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

