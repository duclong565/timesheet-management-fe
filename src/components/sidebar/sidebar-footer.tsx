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

interface AppSidebarFooterProps {
  user?: User;
}

export function AppSidebarFooter({ user: propUser }: AppSidebarFooterProps) {
  const { authState, logout } = useAuth();

  // Use authenticated user data or fallback to prop/config
  const user = authState.user
    ? {
        name:
          authState.user.name && authState.user.surname
            ? `${authState.user.name} ${authState.user.surname}`.trim()
            : authState.user.username,
        email: authState.user.email,
      }
    : propUser ||
      sidebarConfig.user || { name: 'John Doe', email: 'john@example.com' };

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
