import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import LocaleSwitcher from '@/components/lang/LocaleSwitcher';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { auth } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/auth/login');
  }

  // Only global admins allowed here
  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const serverUser = {
    name: session.user.name ?? '',
    email: session.user.email ?? '',
    image: session.user.image ?? null
  };

  return (
    <SidebarProvider>
      <AppSidebar companies={[]} portalMode="admin" serverUser={serverUser} />
      <SidebarInset className="flex h-screen flex-col">
        <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <ThemeToggle />
            <LocaleSwitcher />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-muted/30">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
