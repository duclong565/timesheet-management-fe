import { usePathname } from 'next/navigation';
import { sidebarConfig } from '@/config/sidebar';
import { NavItem } from '@/types/sidebar';

function findNavItem(items: NavItem[], pathname: string): NavItem | undefined {
  for (const item of items) {
    if (item.url === pathname) {
      return item;
    }
    if (item.children) {
      const found = findNavItem(item.children, pathname);
      if (found) {
        return found;
      }
    }
  }
}

export function usePageTitle(): string {
  const pathname = usePathname();
  const navItem = findNavItem(sidebarConfig.navItems, pathname);
  return navItem?.title || 'Dashboard';
}
