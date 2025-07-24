import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@/components/ui/table';

interface TeamMember {
  id: string;
  name: string;
  surname: string;
  role: string;
  hoursThisMonth: number;
  pendingItems: number;
}

interface TeamSummaryTableProps {
  members: TeamMember[];
}

export default function TeamSummaryTable({ members }: TeamSummaryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Hours (Month)</TableHead>
              <TableHead>Pending Items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  No team members.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    {member.name} {member.surname}
                  </TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>{member.hoursThisMonth}</TableCell>
                  <TableCell>{member.pendingItems}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
