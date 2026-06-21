import { cookies, headers } from 'next/headers';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';

import { getUserCompanies } from '@/components/company/select/actions';
import { Company } from '@/components/company/select/types';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { auth } from '@/lib/auth';
import { Providers } from './providers';
import { getLocale } from 'next-intl/server';
import LocaleSwitcher from '@/components/lang/LocaleSwitcher';
import { Separator } from '@/components/ui/separator';

// DashboardLayout.tsx
export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({headers: await headers()});
  const cookieStore = await cookies();
  const locale = await getLocale();
  const sidebarState = cookieStore.get('sidebar:state')?.value;
  //* get sidebar width from cookie
  const sidebarWidth = cookieStore.get('sidebar:width')?.value;

  let defaultOpen = true;

  if (sidebarState) {
    defaultOpen = sidebarState === 'true';
  }
  const companies: Company[] = session ? await getUserCompanies() : [];

  if (!session) {
    return (
      <Providers lng={locale}>
        <div className="bg-muted/40 flex h-screen flex-col">
          <main className="flex-1 overflow-auto p-4 sm:px-6 sm:py-0">
            {children}
          </main>
        </div>
      </Providers>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar companies={companies} />
      <SidebarInset className="flex h-screen flex-col">
        <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <ThemeToggle />
            <LocaleSwitcher />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
