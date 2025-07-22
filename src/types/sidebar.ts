import { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
  children?: NavItem[];
  isCollapsible?: boolean;
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
}

export interface SidebarConfig {
  companyName?: string;
  companySubtitle?: string;
  logo?: LucideIcon;
  navItems?: NavItem[];
  user?: User;
}
