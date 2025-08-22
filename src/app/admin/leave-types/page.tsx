'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AbsenceType } from '@/types/requests';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function LeaveTypesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['absence-types'],
    queryFn: () => apiClient.getAbsenceTypes({ page: 1, limit: 100 }),
  });

  const absenceTypes = (data?.data as AbsenceType[]) || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AbsenceType | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({
    open: false,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', description: '', is_active: true },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: '', description: '', is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (type: AbsenceType) => {
    setEditing(type);
    form.reset({
      name: type.name,
      description: type.description || '',
      is_active: type.is_active,
    });
    setDialogOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => apiClient.createAbsenceType(values),
    onSuccess: () => {
      toast.success('Absence type created');
      queryClient.invalidateQueries({ queryKey: ['absence-types'] });
      setDialogOpen(false);
    },
    onError: () => toast.error('Failed to create absence type'),
  });

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) =>
      apiClient.updateAbsenceType(editing!.id, values),
    onSuccess: () => {
      toast.success('Absence type updated');
      queryClient.invalidateQueries({ queryKey: ['absence-types'] });
      setDialogOpen(false);
    },
    onError: () => toast.error('Failed to update absence type'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteAbsenceType(id),
    onSuccess: () => {
      toast.success('Absence type deleted');
      queryClient.invalidateQueries({ queryKey: ['absence-types'] });
      setConfirm({ open: false });
    },
    onError: () => toast.error('Failed to delete absence type'),
  });

  const onSubmit = (values: FormValues) => {
    if (editing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Absence Types</CardTitle>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Type
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {absenceTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>{type.description}</TableCell>
                    <TableCell>{type.is_active ? 'Active' : 'Inactive'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(type)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setConfirm({ open: true, id: type.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit' : 'Add'} Absence Type</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register('description')} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch('is_active') ? 'true' : 'false'}
                onValueChange={(v) => form.setValue('is_active', v === 'true')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={confirm.open}
        onOpenChange={(open) => setConfirm({ open })}
        title="Delete absence type"
        description="This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={() => confirm.id && deleteMutation.mutate(confirm.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

