import {
  User as UserIcon,
  ChevronDown,
  LogOut,
  CreditCard,
  Settings as SettingsIcon,
} from 'lucide-react';

import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { User } from '@/types/sidebar';
import { sidebarConfig } from '@/config/sidebar';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { extractUserData, hasValidUserData } from '@/lib/user-utils';

interface AppSidebarFooterProps {
  user?: User;
}

export function AppSidebarFooter({ user: propUser }: AppSidebarFooterProps) {
  const { authState, logout } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration properly
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Show loading state during SSR, initial load, or when auth is loading
  const isLoading = !isHydrated || authState.isLoading;

  // Simplified validation using the utility function
  const hasValidUser =
    authState.isAuthenticated && hasValidUserData(authState.user);
  const shouldShowLoading = isLoading || !hasValidUser;

  if (shouldShowLoading) {
    return (
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 w-full p-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1 group-data-[collapsible=icon]:hidden">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    );
  }

  // Extract user data with fallbacks
  const userData = extractUserData(authState.user);
  const user = userData ||
    propUser ||
    sidebarConfig.user || {
      name: 'Guest User',
      email: 'guest@example.com',
    };

  const handleLogout = () => {
    logout();
  };

  return (
    <SidebarFooter className="border-t p-4">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="w-full" tooltip={user.name}>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 group-data-[collapsible=icon]:hidden" />
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
