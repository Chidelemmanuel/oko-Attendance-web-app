
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent as UiSidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/logo';
import { NAV_ITEMS, type NavItem } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

export function SidebarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const role = localStorage.getItem('userRole');
        setUserRole(role);
    }
  }, [pathname]);


  const isActive = (href: string, matchSegments?: string[]) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (matchSegments) {
      const currentSegments = pathname.split('/').filter(Boolean);
      return matchSegments.every((segment, index) => currentSegments[index] === segment);
    }
    return pathname.startsWith(href);
  };
  
  const handleLogout = async () => {
    try {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if(!res.ok) throw new Error("Logout failed");
        
        if (typeof window !== 'undefined') {
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            localStorage.removeItem('userFullName');
            localStorage.removeItem('userIdentifier');
        }

        toast({ title: 'Logged out successfully' });
        router.push('/');
        router.refresh();

    } catch(error) {
        toast({ variant: 'destructive', title: 'Logout failed', description: 'Could not log you out. Please try again.' });
    }
  }

  const visibleNavItems = NAV_ITEMS.filter(item => 
    !item.roles || (userRole && item.roles.includes(userRole as 'student' | 'lecturer'))
  );

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-semibold text-foreground group-data-[collapsible=icon]:hidden">
            OkoAttend
          </h1>
        </Link>
      </SidebarHeader>
      <UiSidebarContent className="flex-1 px-2">
        <SidebarMenu>
          {visibleNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild={false} 
                  isActive={isActive(item.href, item.matchSegments)}
                  className={cn(
                    'w-full justify-start',
                    isActive(item.href, item.matchSegments)
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/80'
                  )}
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </UiSidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-4">
        <Button variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
          <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </Button>
      </SidebarFooter>
    </>
  );
}
