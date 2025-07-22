import { SidebarHeader } from '@/components/ui/sidebar';
import { sidebarConfig } from '@/config/sidebar';

export function AppSidebarHeader() {
  const { companyName, companySubtitle, logo: LogoIcon } = sidebarConfig;

  return (
    <SidebarHeader className="border-b p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          {LogoIcon && <LogoIcon className="h-4 w-4" />}
        </div>
        <div className="group-data-[collapsible=icon]:hidden">
          <h2 className="text-lg font-semibold">{companyName}</h2>
          <p className="text-xs text-muted-foreground">{companySubtitle}</p>
        </div>
      </div>
    </SidebarHeader>
  );
}
