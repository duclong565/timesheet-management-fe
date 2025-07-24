import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Calendar,
  CheckCircle,
  UserCheck,
  Settings,
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  endpoint: string;
  method: string;
  icon?: React.ReactNode;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

const iconMap: Record<string, React.ReactNode> = {
  clock: <Clock className="w-4 h-4" />,
  calendar: <Calendar className="w-4 h-4" />,
  'check-circle': <CheckCircle className="w-4 h-4" />,
  'user-check': <UserCheck className="w-4 h-4" />,
  settings: <Settings className="w-4 h-4" />,
};

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="flex flex-wrap gap-2 justify-center items-center">
          {actions.length === 0 ? (
            <span className="text-muted-foreground">No quick actions.</span>
          ) : (
            actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                onClick={() => (window.location.href = action.endpoint)}
              >
                {action.icon && typeof action.icon === 'string' && (
                  <span className="mr-2">
                    {iconMap[action.icon] || action.icon}
                  </span>
                )}
                {action.title}
              </Button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
