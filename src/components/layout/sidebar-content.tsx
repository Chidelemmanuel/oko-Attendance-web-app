'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function SidebarContent() {
  const pathname = usePathname();

  const isActive = (href: string, matchSegments?: string[]) => {
    if (href === '/') return pathname === '/';
    if (matchSegments) {
      const currentSegments = pathname.split('/').filter(Boolean);
      return matchSegments.every((segment, index) => currentSegments[index] === segment);
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-semibold text-foreground group-data-[collapsible=icon]:hidden">
            OkoAttend
          </h1>
        </Link>
      </SidebarHeader>
      <UiSidebarContent className="flex-1 px-2">
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild={false} // Important: asChild causes issues with Link sometimes if not handled carefully
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
        <Button variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center">
          <LogOut className="h-5 w-5" />
          <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </Button>
      </SidebarFooter>
    </>
  );
}