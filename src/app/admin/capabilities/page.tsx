'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { apiClient } from '@/lib/api-client';
import { Capability } from '@/types';
import { toast } from 'sonner';

const capabilitySchema = z.object({
  capability_name: z.string().min(1, 'Name is required'),
  type: z.enum(['Point', 'Text']),
  note: z.string().optional(),
});

type CapabilityFormValues = z.infer<typeof capabilitySchema>;

export default function CapabilityManagementPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCapability, setEditingCapability] = useState<Capability | null>(null);
  const [deletingCapability, setDeletingCapability] = useState<Capability | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['capabilities'],
    queryFn: () => apiClient.getCapabilities({ limit: 100 }),
  });

  const form = useForm<CapabilityFormValues>({
    resolver: zodResolver(capabilitySchema),
    defaultValues: { capability_name: '', type: 'Point', note: '' },
  });

  const { mutate: saveCapability, isLoading: isSubmitting } = useMutation({
    mutationFn: (values: CapabilityFormValues) => {
      if (editingCapability) {
        return apiClient.updateCapability(editingCapability.id, values);
      }
      return apiClient.createCapability(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capabilities'] });
      toast.success(`Capability ${editingCapability ? 'updated' : 'created'} successfully`);
      setIsDialogOpen(false);
      setEditingCapability(null);
      form.reset({ capability_name: '', type: 'Point', note: '' });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to save capability';
      toast.error(message);
    },
  });

  const { mutate: removeCapability, isLoading: isDeleting } = useMutation({
    mutationFn: (id: string) => apiClient.deleteCapability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capabilities'] });
      toast.success('Capability deleted');
      setDeletingCapability(null);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to delete capability';
      toast.error(message);
    },
  });

  const capabilities = data?.data || [];

  const openCreate = () => {
    setEditingCapability(null);
    form.reset({ capability_name: '', type: 'Point', note: '' });
    setIsDialogOpen(true);
  };

  const openEdit = (capability: Capability) => {
    setEditingCapability(capability);
    form.reset({
      capability_name: capability.capability_name,
      type: capability.type,
      note: capability.note || '',
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Capabilities</h1>
          <p className="text-muted-foreground">Manage capability definitions</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Capability
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Note</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {capabilities.map((cap) => (
            <TableRow key={cap.id}>
              <TableCell>{cap.capability_name}</TableCell>
              <TableCell>{cap.type}</TableCell>
              <TableCell>{cap.note}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEdit(cap)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setDeletingCapability(cap)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {capabilities.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                {isLoading ? 'Loading capabilities...' : 'No capabilities found'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCapability ? 'Edit Capability' : 'Add Capability'}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((values) => saveCapability(values))}
            className="space-y-4"
          >
            <FormField
              label="Name"
              name="capability_name"
              placeholder="Capability name"
              register={form.register}
              error={form.formState.errors.capability_name}
              required
            />
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Point">Point</SelectItem>
                      <SelectItem value="Text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.type && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.type.message}
                    </p>
                  )}
                </div>
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                {...form.register('note')}
                placeholder="Optional notes"
              />
              {form.formState.errors.note && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.note.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={!!deletingCapability}
        onOpenChange={(open) => !open && setDeletingCapability(null)}
        title="Delete capability"
        description="Are you sure you want to delete this capability?"
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={() => deletingCapability && removeCapability(deletingCapability.id)}
      />
    </div>
  );
}

