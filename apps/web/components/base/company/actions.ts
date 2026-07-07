'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { CompanyInfo } from '@/components/base/types';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getCurrentCompanyForInvoice(): Promise<CompanyInfo | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect('/auth/login');
  }
  if (!session?.user?.activeCompanyId) {
    redirect('/select-company');
  }

  return prisma.company.findUnique({
    where: { id: session.user.activeCompanyId },
    select: {
      name: true,
      legalName: true,
      taxId: true,
      email: true,
      phone: true,
      website: true,
      address: true,
      logo: true
    }
  });
}
