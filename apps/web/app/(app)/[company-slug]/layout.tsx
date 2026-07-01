import { headers } from 'next/headers';
import { redirect } from 'next/navigation'
import { getUserCompanies } from '@/components/company/select/actions';
import { Company } from '@/components/company/select/types';
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

// DashboardLayout.tsx
export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect('/auth/login');
  }

  const companies: Company[] = session ? await getUserCompanies() : [];

  const activeCompany = session?.user?.availableCompanies?.find(
    (c) => c.companyId === session.user.activeCompanyId
  );
  const companySystemRole = activeCompany?.systemRole ?? null;

  if (!session) {
    return (
      <div className="bg-muted/40 flex h-screen flex-col">
        <main className="flex-1 overflow-auto p-4 sm:px-6 sm:py-0">
          {children}
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar 
        companies={companies} 
        companySystemRole={companySystemRole} 
        portalMode="company"
      />
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
