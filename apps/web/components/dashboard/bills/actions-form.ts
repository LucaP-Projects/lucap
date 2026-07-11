'use server';

import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getBillFormData() {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) {
    return { vendors: [], accounts: [] };
  }
  const companyId = session.user.activeCompanyId;

  const [vendors, accounts] = await Promise.all([
    prisma.vendor.findMany({
      where: { companyId, isActive: true, status: 'ACTIVE' },
      select: { id: true, displayName: true },
      orderBy: { displayName: 'asc' },
    }),
    prisma.account.findMany({
      where: { companyId, is_active: true },
      select: { id: true, title: true, number: true },
      orderBy: { number: 'asc' },
    }),
  ]);

  return { vendors, accounts };
}
