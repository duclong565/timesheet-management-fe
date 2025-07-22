import {
  Home,
  User,
  Calendar,
  Clock,
  FileText,
  Users,
  Building,
  BarChart3,
  Shield,
  Key,
  Cog,
  UserCheck,
  Plane,
  MapPin,
  Briefcase,
  Users2,
  ClipboardList,
  Eye,
  FolderOpen,
  Timer,
  History,
  GraduationCap,
  Target,
  Activity,
  CalendarDays,
  CheckSquare,
  Settings,
} from 'lucide-react';
import { NavItem, SidebarConfig } from '@/types/sidebar';

// Main navigation items with new hierarchical structure
export const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
  },
  {
    title: 'My Information',
    url: '/profile',
    icon: User,
  },
  {
    title: 'Admin',
    url: '/admin',
    icon: Shield,
    isCollapsible: true,
    children: [
      {
        title: 'Users',
        url: '/admin/users',
        icon: Users,
      },
      {
        title: 'Roles',
        url: '/admin/roles',
        icon: Key,
      },
      {
        title: 'Configuration',
        url: '/admin/configuration',
        icon: Cog,
      },
      {
        title: 'Clients',
        url: '/admin/clients',
        icon: Building,
      },
      {
        title: 'Tasks',
        url: '/admin/tasks',
        icon: CheckSquare,
      },
      {
        title: 'Leave types',
        url: '/admin/leave-types',
        icon: Plane,
      },
      {
        title: 'Branches',
        url: '/admin/branches',
        icon: MapPin,
      },
      {
        title: 'Position',
        url: '/admin/positions',
        icon: UserCheck,
      },
      {
        title: 'Capability',
        url: '/admin/capabilities',
        icon: Target,
      },
      {
        title: 'Capability setting',
        url: '/admin/capability-settings',
        icon: Settings,
      },
      {
        title: 'Offday setting',
        url: '/admin/offday-settings',
        icon: CalendarDays,
      },
      {
        title: 'Overtime Settings',
        url: '/admin/overtime-settings',
        icon: Timer,
      },
      {
        title: 'Audit log',
        url: '/admin/audit-logs',
        icon: History,
      },
      {
        title: 'Background job',
        url: '/admin/background-jobs',
        icon: Activity,
      },
    ],
  },
  {
    title: 'Personal Timesheet',
    url: '/personal',
    icon: Calendar,
    isCollapsible: true,
    children: [
      {
        title: 'My timesheet',
        url: '/personal/timesheet',
        icon: Clock,
      },
      {
        title: 'My off/remote/onsite requests',
        url: '/personal/requests',
        icon: FileText,
      },
      {
        title: 'Team working calendar',
        url: '/personal/team-calendar',
        icon: CalendarDays,
      },
      {
        title: 'My Working time',
        url: '/personal/working-time',
        icon: Timer,
      },
    ],
  },
  {
    title: 'Management',
    url: '/management',
    icon: Briefcase,
    isCollapsible: true,
    children: [
      {
        title: 'Team building',
        url: '/management/team-building',
        icon: Users2,
      },
      {
        title: 'Report',
        url: '/management/reports',
        icon: BarChart3,
      },
      {
        title: 'Manage off/remote/onsite requests',
        url: '/management/requests',
        icon: ClipboardList,
      },
      {
        title: 'Timesheet management',
        url: '/management/timesheet',
        icon: Calendar,
      },
      {
        title: 'Timesheets monitoring',
        url: '/management/timesheet-monitoring',
        icon: Eye,
      },
      {
        title: 'Project management',
        url: '/management/projects',
        icon: FolderOpen,
      },
      {
        title: 'Manage employee working times',
        url: '/management/working-times',
        icon: Clock,
      },
      {
        title: 'Retrospective',
        url: '/management/retrospective',
        icon: History,
      },
      {
        title: 'Review interns',
        url: '/management/review-interns',
        icon: GraduationCap,
      },
    ],
  },
];

// Complete sidebar configuration
export const sidebarConfig: SidebarConfig = {
  companyName: 'TimesheetPro',
  companySubtitle: 'NCC Plus',
  logo: Clock,
  navItems: mainNavItems,
  user: {
    name: 'John Doe',
    email: 'john@example.com',
  },
};
