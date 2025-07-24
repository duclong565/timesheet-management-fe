import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RecentActivity } from '@/types/dashboard';

interface ActivitiesListProps {
  activities: RecentActivity[];
}

export default function ActivitiesList({ activities }: ActivitiesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {activities.length === 0 ? (
            <li className="text-muted-foreground">No recent activities.</li>
          ) : (
            activities.map((activity, idx) => (
              <li
                key={idx}
                className="flex flex-col border-b last:border-b-0 pb-2"
              >
                <span className="font-medium">{activity.title}</span>
                <span className="text-sm text-muted-foreground">
                  {activity.description}
                </span>
                <span className="text-xs mt-1 text-info">{activity.type}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(activity.created_at).toLocaleString()}
                </span>
              </li>
            ))
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
