'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  workingHours: z.number().min(0, 'Working hours must be positive'),
  allowOvertime: z.enum(['yes', 'no']),
});

export default function SystemConfigurationPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      siteName: '',
      workingHours: 8,
      allowOvertime: 'yes',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('System configuration submitted:', values);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">System configuration</h1>
        <p className="text-muted-foreground">
          Manage global application settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site name</FormLabel>
                    <FormControl>
                      <Input placeholder="TimesheetPro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workingHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Working hours per day</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(e.target.value === '' ? 0 : Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowOvertime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allow overtime</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Save changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

