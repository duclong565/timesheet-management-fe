import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { User } from '@/types';
import { Edit } from 'lucide-react';

export function ProfileChangeRequestModal({
  profile,
  onSuccess,
}: {
  profile: User;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name || '',
    surname: profile?.surname || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    sex: profile?.sex || '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      // Use fetch directly for custom endpoint
      const res = await fetch('/api/proxy/users/me/change-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to submit request');
      }
      return res.json();
    },
    onSuccess: () => {
      setSuccess('Request submitted! Await HR/ADMIN approval.');
      setError(null);
      onSuccess?.();
      setTimeout(() => setOpen(false), 1200);
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
      setSuccess(null);
    },
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    mutation.mutate(form);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request change info</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Surname</label>
            <Input
              name="surname"
              value={form.surname}
              onChange={handleChange}
              placeholder="Enter your surname"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <Input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Address</label>
            <Input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter your address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Sex</label>
            <select
              name="sex"
              value={form.sex}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="">Select...</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="default"
              disabled={mutation.status === 'pending'}
            >
              {mutation.status === 'pending'
                ? 'Submitting...'
                : 'Request change info'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
