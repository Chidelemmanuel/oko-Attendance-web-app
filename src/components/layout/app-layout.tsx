
'use client';

import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SidebarContent } from './sidebar-content';
import { Button } from '@/components/ui/button';
import { Bell, Settings } from 'lucide-react';
import { Logo } from '../icons/logo';

const AUTH_ROUTES = [
    '/auth/student/login', '/auth/student/signup',
    '/auth/lecturer/login', '/auth/lecturer/signup',
    '/auth/admin/login', '/auth/admin/signup'
];

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isAuthPage = AUTH_ROUTES.includes(pathname) || pathname === '/';

    if(isAuthPage) {
        return (
            <main className="flex-1">
                {children}
            </main>
        );
    }
  
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar" collapsible="icon" side="left">
        <SidebarContent />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2">
             <SidebarTrigger className="md:hidden" /> {/* Mobile trigger */}
             <div className="flex items-center gap-2 md:hidden">
                <Logo className="h-6 w-6 text-primary" />
                <h1 className="text-lg font-semibold">OkoAttend</h1>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
            {/* User profile dropdown can be added here */}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
