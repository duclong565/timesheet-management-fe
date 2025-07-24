'use client';

import { usePathname } from 'next/navigation';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/sidebar';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { LoadingScreen } from '@/components/ui/loading';
import { ErrorBoundary } from '@/components/error-boundary';
import { PageHeader } from '@/components/layout/page-header';


interface MainLayoutProps {
  children: React.ReactNode;
}

// Routes that should not show the sidebar
const NO_SIDEBAR_ROUTES = ['/login'];

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, shouldShowContent } = useAuthRedirect();

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Don't show content if redirect is in progress
  if (!shouldShowContent) {
    return <LoadingScreen />;
  }

  // Check if current route should show sidebar
  const shouldShowSidebar =
    isAuthenticated && !NO_SIDEBAR_ROUTES.includes(pathname);

  if (shouldShowSidebar) {
    // Show layout with sidebar for authenticated users
    return (
      <ErrorBoundary>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            
            <PageHeader />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </ErrorBoundary>
    );
  }

  // Show layout without sidebar for auth pages or unauthenticated users
  return (
    <ErrorBoundary>
      <main className="min-h-screen">{children}</main>
    </ErrorBoundary>
  );
}
