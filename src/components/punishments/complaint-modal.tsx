'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useCreateComplaint, useUpdateComplaint } from '@/hooks/punishments';

interface ComplaintModalProps {
  isOpen: boolean;
  timesheetId?: string;
  existingComplaint?: {
    id: string;
    complain: string;
    complain_reply?: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ComplaintModal({
  isOpen,
  timesheetId,
  existingComplaint,
  onClose,
  onSuccess,
}: ComplaintModalProps) {
  const [complaintText, setComplaintText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const { createComplaint, isCreating } = useCreateComplaint();
  const { updateComplaint, isUpdating } = useUpdateComplaint();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setComplaintText(existingComplaint?.complain || '');
      setErrors([]);
    } else {
      setComplaintText('');
      setErrors([]);
    }
  }, [isOpen, existingComplaint]);

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!complaintText.trim()) {
      newErrors.push('Complaint text is required');
    }

    if (complaintText.trim().length < 10) {
      newErrors.push('Complaint must be at least 10 characters long');
    }

    if (complaintText.trim().length > 500) {
      newErrors.push('Complaint cannot exceed 500 characters');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !timesheetId) return;

    try {
      if (existingComplaint) {
        // Update existing complaint
        await updateComplaint({
          id: existingComplaint.id,
          complain: complaintText.trim(),
        });
      } else {
        // Create new complaint
        await createComplaint({
          timesheet_id: timesheetId,
          complain: complaintText.trim(),
        });
      }
      onSuccess();
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  const isSubmitting = isCreating || isUpdating;
  const isReadOnly = existingComplaint?.complain_reply; // Can't edit if admin replied

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingComplaint ? 'Edit Complaint' : 'Submit Complaint'}
          </DialogTitle>
          <DialogDescription>
            {isReadOnly
              ? 'This complaint has already been reviewed by an administrator.'
              : existingComplaint
              ? 'You can edit your complaint until an administrator responds.'
              : 'Please describe your concern about this timesheet entry. Be specific about what you believe is incorrect.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Complaint Text */}
          <div className="space-y-2">
            <Label htmlFor="complaint">Complaint Details</Label>
            <Textarea
              id="complaint"
              placeholder="Please explain what you believe is incorrect about this timesheet entry..."
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              disabled={isReadOnly || isSubmitting}
              className="min-h-[120px]"
              maxLength={500}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{complaintText.length}/500 characters</span>
              <span>Minimum 10 characters required</span>
            </div>
          </div>

          {/* Admin Reply (if exists) */}
          {existingComplaint?.complain_reply && (
            <div className="space-y-2">
              <Label>Administrator Response</Label>
              <div className="p-3 bg-muted rounded-md text-sm">
                {existingComplaint.complain_reply}
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="space-y-1">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-destructive">
                  • {error}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          {!isReadOnly && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !complaintText.trim()}
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {existingComplaint ? 'Update Complaint' : 'Submit Complaint'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
