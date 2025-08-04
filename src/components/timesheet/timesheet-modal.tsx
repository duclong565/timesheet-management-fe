'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTimesheetModalStore } from '@/stores/timesheet-modal-store';
import { TimesheetForm } from './timesheet-form';
import { formatDisplayDate } from '@/lib/date-utils';

export function TimesheetModal() {
  const { isOpen, mode, closeModal, selectedDate } = useTimesheetModalStore();

  const handleSuccess = () => {
    closeModal();
  };

  const handleCancel = () => {
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Timesheet' : 'Edit Timesheet'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? (
              <>
                Add a new timesheet entry
                {selectedDate && (
                  <>
                    {' '}
                    for{' '}
                    {formatDisplayDate(new Date(selectedDate), 'MEDIUM_DATE')}
                  </>
                )}
                . Fill in the details below.
              </>
            ) : (
              'Update the timesheet entry details below.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <TimesheetForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
