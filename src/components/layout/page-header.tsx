'use client';
import { usePageTitle } from '@/hooks/use-page-title';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function PageHeader() {
  const title = usePageTitle();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex items-center gap-2 text-sm font-medium">
        <span>{title}</span>
      </div>
    </header>
  );
}
