'use server';

import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getVendorCreditFormData() {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return { vendors: [], accounts: [] };

  const [vendors, accounts] = await Promise.all([
    prisma.vendor.findMany({
      where: { companyId: session.user.activeCompanyId, isActive: true, status: 'ACTIVE' },
      select: { id: true, displayName: true },
      orderBy: { displayName: 'asc' },
    }),
    prisma.account.findMany({
      where: { companyId: session.user.activeCompanyId, is_active: true },
      select: { id: true, title: true, number: true },
      orderBy: { number: 'asc' },
    }),
  ]);

  return { vendors, accounts };
}