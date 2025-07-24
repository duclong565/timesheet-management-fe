import { DashboardData } from '@/types/dashboard';
import StatCard from './widgets/stat-card';
import ChartCard from './widgets/chart-card';
import PendingItemsList from './widgets/pending-items-list';
import ActivitiesList from './widgets/activities-list';
import TeamSummaryTable from './widgets/team-summary-table';
import QuickActions from './widgets/quick-actions';
import { Card } from '@/components/ui/card';

interface ManagerDashboardProps {
  data: DashboardData;
}

export default function ManagerDashboard({ data }: ManagerDashboardProps) {
  const metrics = data.team_metrics;
  const charts = data.charts || [];
  const pendingItems = data.pending_items || [];
  const activities = data.recent_activities || [];
  const teamSummary = data.team_summary || [];
  const quickActions = data.quick_actions || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<span>👥</span>}
            label="Team Members"
            value={`${metrics.active_team_members}/${metrics.total_team_members}`}
            color="text-primary"
          />
          <StatCard
            icon={<span>⏰</span>}
            label="Team Hours (Month)"
            value={metrics.total_team_hours_this_month}
            color="text-success"
          />
          <StatCard
            icon={<span>🕒</span>}
            label="Pending Timesheets"
            value={metrics.total_pending_timesheets}
            color={
              metrics.total_pending_timesheets > 0
                ? 'text-warning'
                : 'text-success'
            }
          />
          <StatCard
            icon={<span>📋</span>}
            label="Pending Requests"
            value={metrics.total_pending_requests}
            color={
              metrics.total_pending_requests > 0
                ? 'text-warning'
                : 'text-success'
            }
          />
        </div>
      )}

      {/* Charts */}
      {charts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {charts.map((chart, idx) => (
            <ChartCard key={idx} title={chart.title}>
              {/* Chart rendering placeholder */}
              <Card className="h-40 flex items-center justify-center text-muted-foreground">
                Chart goes here
              </Card>
            </ChartCard>
          ))}
        </div>
      )}

      {/* Team Summary */}
      <TeamSummaryTable
        members={teamSummary.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          surname: member.user.surname,
          role: member.user.position || '',
          hoursThisMonth: member.this_month_hours,
          pendingItems: member.pending_timesheets + member.pending_requests,
        }))}
      />

      {/* Pending Items & Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PendingItemsList items={pendingItems} />
        <ActivitiesList activities={activities} />
      </div>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />
    </div>
  );
}
