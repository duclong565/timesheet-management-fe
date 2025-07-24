import { DashboardData } from '@/types/dashboard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import MetricsSection from './sections/metrics-section';
import ChartsSection from './sections/charts-section';
import PendingSection from './sections/pending-section';
import ActivitiesSection from './sections/activities-section';
import QuickActionsSection from './sections/quick-actions-section';

interface PersonalDashboardProps {
  data: DashboardData;
}

export default function PersonalDashboard({ data }: PersonalDashboardProps) {
  return (
    <Tabs
      defaultValue="overview"
      className="flex flex-col gap-6"
      aria-label="Personal dashboard sections"
    >
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="activities">Activities</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="space-y-6">
          <MetricsSection metrics={data.personal_metrics} />
          <ChartsSection charts={data.charts} />
        </div>
      </TabsContent>

      <TabsContent value="pending">
        <PendingSection items={data.pending_items} />
      </TabsContent>

      <TabsContent value="activities">
        <ActivitiesSection activities={data.recent_activities} />
      </TabsContent>

      <QuickActionsSection actions={data.quick_actions} />
    </Tabs>
  );
}
