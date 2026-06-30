import { headers } from 'next/headers';
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server';
import { getUserCompanies } from '@/components/company/select/actions';
import { Company } from '@/components/company/select/types';
import LocaleSwitcher from '@/components/lang/LocaleSwitcher';
import { AppSidebar, UnverifiedCounts } from '@/components/sidebar/app-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';

import { auth } from '@/lib/auth';
import { Providers } from './providers';

const ACCOUNTANT_SYSTEM_ROLES = ['SUPER_ACCOUNTANT', 'ACCOUNTANT_STAFF'];

// Placeholder — returns 0 for all types until the paper validation flow is built.
// Once papers have a verifiedByAccountant status, query counts here.
async function getUnverifiedCounts(_companyId: string): Promise<UnverifiedCounts> {
  return {
    invoices: 0,
    payments: 0,
    customers: 0,
    estimates: 0,
    creditMemos: 0,
    salesReceipts: 0,
    delayedCharges: 0,
    delayedCredits: 0,
    refundReceipts: 0,
  };
}

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

  const locale = await getLocale();


  const companies: Company[] = session ? await getUserCompanies() : [];

  const activeCompany = session?.user?.availableCompanies?.find(
    (c) => c.companyId === session.user.activeCompanyId
  );
  const companySystemRole = activeCompany?.systemRole ?? null;

  const isAccountantRole =
    companySystemRole !== null &&
    ACCOUNTANT_SYSTEM_ROLES.includes(companySystemRole);

  const unverifiedCounts = isAccountantRole && activeCompany?.companyId
    ? await getUnverifiedCounts(activeCompany.companyId)
    : undefined;

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

  const serverUser = {
    name: session.user.name ?? '',
    email: session.user.email ?? '',
    image: session.user.image ?? null,
  };

  return (
    <SidebarProvider>
      <AppSidebar
        companies={companies}
        companySystemRole={companySystemRole}
        unverifiedCounts={unverifiedCounts}
        serverUser={serverUser}
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
