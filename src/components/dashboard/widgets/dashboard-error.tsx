import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function DashboardError({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
