'use client';

import { useState, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { CapabilitySetting, Position, Capability } from '@/types';

export default function CapabilitySettingsPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    positionId: '',
    capabilityId: '',
    coefficient: '',
  });

  const queryClient = useQueryClient();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['capability-settings'],
    queryFn: () => apiClient.getCapabilitySettings(),
  });

  const { data: positionsData } = useQuery({
    queryKey: ['positions'],
    queryFn: () => apiClient.getPositions(),
  });

  const { data: capabilitiesData } = useQuery({
    queryKey: ['capabilities'],
    queryFn: () => apiClient.getCapabilities(),
  });

  const capabilitySettings = settingsData?.data ?? [];
  const positions: Position[] = positionsData?.data ?? [];
  const capabilities: Capability[] = capabilitiesData?.data ?? [];

  const { mutate: createSetting, isLoading: isCreating } = useMutation({
    mutationFn: () =>
      apiClient.createCapabilitySetting({
        position_id: form.positionId,
        capability_id: form.capabilityId,
        coefficient: form.coefficient
          ? parseFloat(form.coefficient)
          : undefined,
      }),
    onSuccess: () => {
      toast.success('Capability setting created');
      setOpen(false);
      setForm({ positionId: '', capabilityId: '', coefficient: '' });
      queryClient.invalidateQueries({ queryKey: ['capability-settings'] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to create capability setting';
      toast.error(message);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.positionId || !form.capabilityId) return;
    createSetting();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Capability Settings</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Setting</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Capability Setting</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Select
                  value={form.positionId}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, positionId: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.position_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Capability</Label>
                <Select
                  value={form.capabilityId}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, capabilityId: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select capability" />
                  </SelectTrigger>
                  <SelectContent>
                    {capabilities.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.capability_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coefficient">Coefficient</Label>
                <Input
                  id="coefficient"
                  type="number"
                  step="0.01"
                  value={form.coefficient}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, coefficient: e.target.value }))
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Capability</TableHead>
              <TableHead>Coefficient</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {capabilitySettings.map((setting: CapabilitySetting) => (
              <TableRow key={setting.id}>
                <TableCell>{setting.position.position_name}</TableCell>
                <TableCell>{setting.capability.capability_name}</TableCell>
                <TableCell>{setting.coefficient ?? '-'}</TableCell>
              </TableRow>
            ))}
            {!isLoading && capabilitySettings.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No capability settings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

