import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

const ACCOUNTANT_SYSTEM_ROLES = ['SUPER_ACCOUNTANT', 'ACCOUNTANT_STAFF'] as const;

export default async function AccountantPortalLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ 'company-slug': string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/auth/login');
  }

  const { 'company-slug': companySlug } = await params;

  const activeCompany = session.user.availableCompanies?.find(
    (c) => c.companyId === session.user.activeCompanyId
  );

  const systemRole = activeCompany?.systemRole;

  if (!systemRole || !ACCOUNTANT_SYSTEM_ROLES.includes(systemRole as (typeof ACCOUNTANT_SYSTEM_ROLES)[number])) {
    redirect(`/${companySlug}`);
  }

  return <>{children}</>;
}
