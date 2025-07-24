import { PersonalMetrics } from '@/types/dashboard';
import StatCard from '../widgets/stat-card';
import EmptyState from '../widgets/empty-state';

interface MetricsSectionProps {
  metrics?: PersonalMetrics;
}

export default function MetricsSection({ metrics }: MetricsSectionProps) {
  if (!metrics) {
    return <EmptyState message="No metrics available yet." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<span>⏰</span>}
        label="Total Hours"
        value={metrics.total_working_hours || 0}
        color="text-primary"
        tooltip="Total approved working hours for this user."
      />
      <StatCard
        icon={<span>📅</span>}
        label="This Month"
        value={metrics.this_month_hours || 0}
        color="text-success"
        tooltip="Working hours logged this month."
      />
      <StatCard
        icon={<span>🕒</span>}
        label="Pending Timesheets"
        value={metrics.pending_timesheets || 0}
        color={
          (metrics.pending_timesheets || 0) > 0
            ? 'text-warning'
            : 'text-success'
        }
        tooltip="Timesheets awaiting approval."
      />
      <StatCard
        icon={<span>🌴</span>}
        label="Leave Days Left"
        value={metrics.remaining_leave_days || 0}
        color={
          (metrics.remaining_leave_days || 0) < 5 ? 'text-danger' : 'text-info'
        }
        tooltip="Remaining leave days for this year."
      />
    </div>
  );
}
