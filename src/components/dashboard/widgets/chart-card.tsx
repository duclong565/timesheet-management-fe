import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode; // Chart component
}

export default function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
