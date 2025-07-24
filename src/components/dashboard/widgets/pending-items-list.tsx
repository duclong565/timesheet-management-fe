import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PendingItem {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  created_at: string;
}

interface PendingItemsListProps {
  items: PendingItem[];
}

export default function PendingItemsList({ items }: PendingItemsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Items</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.length === 0 ? (
            <li className="text-muted-foreground">No pending items.</li>
          ) : (
            items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col border-b last:border-b-0 pb-2"
              >
                <span className="font-medium">{item.title}</span>
                <span className="text-sm text-muted-foreground">
                  {item.description}
                </span>
                <Badge
                  variant={
                    item.priority === 'HIGH'
                      ? 'destructive'
                      : item.priority === 'MEDIUM'
                      ? 'secondary'
                      : 'default'
                  }
                >
                  {item.priority} Priority
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Created: {new Date(item.created_at).toLocaleString()}
                </span>
              </li>
            ))
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
