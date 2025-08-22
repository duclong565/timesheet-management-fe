'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const overtimeSettingsSchema = z.object({
  weekdayRate: z
    .number({ invalid_type_error: 'Required' })
    .min(0, { message: 'Rate must be non-negative' }),
  weekendRate: z
    .number({ invalid_type_error: 'Required' })
    .min(0, { message: 'Rate must be non-negative' }),
});

type OvertimeSettingsForm = z.infer<typeof overtimeSettingsSchema>;

export default function OvertimeSettingsPage() {
  const form = useForm<OvertimeSettingsForm>({
    resolver: zodResolver(overtimeSettingsSchema),
    defaultValues: {
      weekdayRate: 1.5,
      weekendRate: 2,
    },
  });

  const onSubmit = (data: OvertimeSettingsForm) => {
    // TODO: integrate with backend API
    console.log('Overtime settings saved', data);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Overtime Settings</h1>
        <p className="text-muted-foreground">
          Configure overtime pay rates for weekdays and weekends.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overtime Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="weekdayRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekday Rate (x)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weekendRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekend Rate (x)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

