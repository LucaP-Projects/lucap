'use server';

import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getBillPaymentFormData(vendorId?: string) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) {
    return { vendors: [], bills: [] };
  }
  const companyId = session.user.activeCompanyId;

  const vendors = await prisma.vendor.findMany({
    where: { companyId, isActive: true, status: 'ACTIVE' },
    select: { id: true, displayName: true },
    orderBy: { displayName: 'asc' },
  });

  let bills: Array<{ id: string; number: string; amount: number; status: string }> = [];
  if (vendorId) {
    bills = await prisma.bill.findMany({
      where: {
        vendorId,
        companyId,
        isActive: true,
        status: { in: ['OPEN', 'OVERDUE', 'PARTIALLY_PAID'] },
      },
      select: { id: true, number: true, amount: true, status: true },
      orderBy: { dueDate: 'asc' },
    });
  }

  return { vendors, bills };
}
