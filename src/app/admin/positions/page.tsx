'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Position } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export default function PositionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['positions'],
    queryFn: () => apiClient.getPositions(),
  });

  const positions = (data?.data as Position[]) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Positions</h1>
          <p className="text-muted-foreground">Manage organization positions</p>
        </div>
        <Button>Add Position</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={2}>Loading positions...</TableCell>
            </TableRow>
          )}

          {!isLoading && positions.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} className="text-center">
                No positions found.
              </TableCell>
            </TableRow>
          )}

          {positions.map((position) => (
            <TableRow key={position.id}>
              <TableCell className="font-medium">{position.position_name}</TableCell>
              <TableCell>{position.description || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

