'use server';

import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getPurchaseFormData() {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) {
    return { vendors: [], accounts: [], classes: [], departments: [] };
  }
  const companyId = session.user.activeCompanyId;

  const [vendors, accounts, classes, departments] = await Promise.all([
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
    prisma.class.findMany({
      where: { companyId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.department.findMany({
      where: { companyId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return { vendors, accounts, classes, departments };
}