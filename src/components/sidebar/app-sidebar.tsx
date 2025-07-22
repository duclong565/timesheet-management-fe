import { Sidebar, SidebarRail } from '@/components/ui/sidebar';
import { AppSidebarHeader } from '@/components/sidebar/sidebar-header';
import { AppSidebarNav } from '@/components/sidebar/sidebar-nav';
import { AppSidebarFooter } from '@/components/sidebar/sidebar-footer';

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <AppSidebarHeader />
      <AppSidebarNav />
      <AppSidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}
