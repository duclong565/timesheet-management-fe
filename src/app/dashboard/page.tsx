'use client';

import { useEffect, useState } from 'react';
import { useDashboard } from '@/hooks/use-dashboard';
import PersonalDashboard from '@/components/dashboard/personal-dashboard';
import ManagerDashboard from '@/components/dashboard/manager-dashboard';
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import DashboardSkeleton from '@/components/dashboard/widgets/dashboard-skeleton';
import DashboardError from '@/components/dashboard/widgets/dashboard-error';
// Optional: import useHealthCheck if you have it
// import { useHealthCheck } from '@/hooks/use-health-check';

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { data, isLoading, error, isAuthenticated } = useDashboard();
  // Optional: const { isBackendHealthy, error: healthError } = useHealthCheck();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <DashboardSkeleton />;
  }

  // Optional: Uncomment if you use a backend health check
  // if (isBackendHealthy === false) {
  //   return <DashboardError message={`Backend server is not running. Please start the backend server first. ${healthError || ''}`} />;
  // }

  if (!isAuthenticated) {
    return <DashboardError message="Please log in to view the dashboard." />;
  }

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <DashboardError message={error.message || String(error)} />;
  if (!data) return null;

  switch (data.dashboard_type) {
    case 'admin':
      return <AdminDashboard data={data} />;
    case 'manager':
      return <ManagerDashboard data={data} />;
    default:
      return <PersonalDashboard data={data} />;
  }
}
