import { DashboardData } from '@/types/dashboard';
import StatCard from './widgets/stat-card';
import ChartCard from './widgets/chart-card';
import PendingItemsList from './widgets/pending-items-list';
import ActivitiesList from './widgets/activities-list';
import TeamSummaryTable from './widgets/team-summary-table';
import QuickActions from './widgets/quick-actions';
import { Card } from '@/components/ui/card';

interface AdminDashboardProps {
  data: DashboardData;
}

export default function AdminDashboard({ data }: AdminDashboardProps) {
  const metrics = data.system_metrics;
  const charts = data.charts || [];
  const pendingItems = data.pending_items || [];
  const activities = data.recent_activities || [];
  const teamSummary = data.team_summary || [];
  const quickActions = data.quick_actions || [];

  // Debug logging
  console.log('AdminDashboard data:', data);
  console.log('System metrics:', metrics);
  console.log('Has system_metrics:', !!metrics);

  // Default/placeholder metrics when no data exists
  const defaultMetrics = {
    total_users: 1,
    active_users: 1,
    total_projects: 0,
    active_projects: 0,
    total_timesheets_this_month: 0,
    total_requests_this_month: 0,
    system_health_score: 100,
  };

  // Default quick actions for admins
  const defaultQuickActions = [
    {
      id: 'submit-timesheet',
      title: 'Submit Timesheet',
      description: 'Submit your timesheet for approval',
      endpoint: '/timesheets',
      method: 'GET',
      icon: 'clock',
    },
    {
      id: 'request-leave',
      title: 'Request Leave',
      description: 'Submit a leave request',
      endpoint: '/requests',
      method: 'GET',
      icon: 'calendar',
    },
    {
      id: 'review-timesheets',
      title: 'Review Timesheets',
      description: 'Review pending timesheets',
      endpoint: '/timesheets?status=PENDING',
      method: 'GET',
      icon: 'check-circle',
    },
    {
      id: 'review-requests',
      title: 'Review Requests',
      description: 'Review pending requests',
      endpoint: '/requests?status=PENDING',
      method: 'GET',
      icon: 'user-check',
    },
    {
      id: 'system-overview',
      title: 'System Overview',
      description: 'View system analytics',
      endpoint: '/admin/analytics',
      method: 'GET',
      icon: 'settings',
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage users and roles',
      endpoint: '/admin/users',
      method: 'GET',
      icon: 'users',
    },
  ];

  const displayMetrics = metrics || defaultMetrics;
  const displayActions =
    quickActions.length > 0 ? quickActions : defaultQuickActions;

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Cards - Always show, using defaults if no data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<span>👤</span>}
          label="Active Users"
          value={`${displayMetrics.active_users}/${displayMetrics.total_users}`}
          color="text-primary"
        />
        <StatCard
          icon={<span>💼</span>}
          label="Active Projects"
          value={`${displayMetrics.active_projects}/${displayMetrics.total_projects}`}
          color="text-success"
        />
        <StatCard
          icon={<span>📊</span>}
          label="System Health"
          value={`${displayMetrics.system_health_score}%`}
          color={
            displayMetrics.system_health_score > 80
              ? 'text-success'
              : displayMetrics.system_health_score > 60
              ? 'text-warning'
              : 'text-danger'
          }
        />
        <StatCard
          icon={<span>📝</span>}
          label="Timesheets (Month)"
          value={displayMetrics.total_timesheets_this_month}
          color="text-info"
        />
      </div>

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
      <QuickActions actions={displayActions} />
    </div>
  );
}
