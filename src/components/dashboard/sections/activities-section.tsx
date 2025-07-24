import { RecentActivity } from '@/types/dashboard';
import ActivitiesList from '../widgets/activities-list';
import EmptyState from '../widgets/empty-state';

interface ActivitiesSectionProps {
  activities?: RecentActivity[];
}

export default function ActivitiesSection({
  activities = [],
}: ActivitiesSectionProps) {
  if (activities.length === 0) {
    return <EmptyState message="No recent activities yet." />;
  }

  return <ActivitiesList activities={activities} />;
}
