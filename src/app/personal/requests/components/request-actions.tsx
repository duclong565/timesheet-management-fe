'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRequestModalStore } from '@/stores/request-modal-store';
import { Info } from 'lucide-react';

interface RequestActionsProps {
  selectedDates: Date[];
}

export function RequestActions({ selectedDates }: RequestActionsProps) {
  const { openCreateModal } = useRequestModalStore();
  const hasSelection = selectedDates.length > 0;

  const handleRequestOff = () => {
    openCreateModal('OFF', 'FULL_DAY', selectedDates);
  };

  const handleRequestRemote = () => {
    openCreateModal('REMOTE', 'FULL_DAY', selectedDates);
  };

  const handleRequestOnsite = () => {
    openCreateModal('ONSITE', 'FULL_DAY', selectedDates);
  };

  const handleRequestTime = () => {
    openCreateModal('OFF', 'TIME', selectedDates);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasSelection && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 mb-4 bg-blue-50 rounded-md border border-blue-200">
            <Info className="h-5 w-5 text-blue-600" />
            <span>
              Please select one or more days on the calendar to make a request.
            </span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={handleRequestOff}
          disabled={!hasSelection}
          variant="outline"
        >
          Request Off
        </Button>
        <Button
          onClick={handleRequestRemote}
          disabled={!hasSelection}
          variant="outline"
        >
          Request Remote
        </Button>
        <Button
          onClick={handleRequestOnsite}
          disabled={!hasSelection}
          variant="outline"
        >
          Request Onsite
        </Button>
        <Button
          onClick={handleRequestTime}
          disabled={!hasSelection}
          variant="outline"
        >
          Request Late Arrival/Early Departure
        </Button>
        </div>
      </CardContent>
    </Card>
  );
}