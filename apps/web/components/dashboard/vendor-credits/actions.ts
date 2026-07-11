'use server';
import { startOfDay, endOfDay } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { VendorCreditStatus } from '@/lib/generated/prisma/enums';
import * as Prisma from '@/lib/generated/prisma/internal/prismaNamespace';
import { prisma } from '@/lib/prisma';
import { generateUniqueNumber } from '@/lib/utils';

export type VendorCreditBasic = Prisma.VendorCreditGetPayload<{
  include: { vendor: { select: { displayName: true } } };
}>;

export type VendorCreditWithRelations = Prisma.VendorCreditGetPayload<{
  include: {
    vendor: { select: { id: true; displayName: true; primaryEmail: true; primaryPhone: true } };
    lineItems: { include: { account: { select: { id: true; title: true; number: true } } } };
  };
}>;

export type VendorCreditFilters = {
  status?: VendorCreditStatus | undefined;
  vendorId?: string | undefined;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  search?: string | undefined;
};

export async function getVendorCreditsPage(
  page: number = 1,
  pageSize: number = 10,
  filters: VendorCreditFilters = {}
) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  const validPage = Math.max(1, page);
  const validPageSize = Math.min(Math.max(1, pageSize), 100);
  const skip = (validPage - 1) * validPageSize;

  const where: any = {
    companyId: session.user.activeCompanyId,
    isActive: true,
  };

  if (filters.status) where.status = filters.status;
  if (filters.vendorId) where.vendorId = filters.vendorId;
  if (filters.dateFrom || filters.dateTo) {
    where.creditDate = {};
    if (filters.dateFrom) where.creditDate.gte = startOfDay(filters.dateFrom);
    if (filters.dateTo) where.creditDate.lte = endOfDay(filters.dateTo);
  }
  if (filters.search) {
    where.vendor = { displayName: { contains: filters.search, mode: 'insensitive' } };
  }

  const [data, total] = await Promise.all([
    prisma.vendorCredit.findMany({
      where,
      include: { vendor: { select: { displayName: true } } },
      skip,
      take: validPageSize,
      orderBy: { creditDate: 'desc' },
    }),
    prisma.vendorCredit.count({ where }),
  ]);

  const pageCount = Math.ceil(total / validPageSize);
  return { data, metadata: { total, page: validPage, pageSize: validPageSize, pageCount } };
}

export async function getVendorCreditDetails(id: string) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');

  return prisma.vendorCredit.findFirst({
    where: { id, companyId: session.user.activeCompanyId, isActive: true },
    include: {
      vendor: { select: { id: true, displayName: true, primaryEmail: true, primaryPhone: true } },
      lineItems: { include: { account: { select: { id: true, title: true, number: true } } } },
    },
  });
}

export async function createVendorCredit(data: {
  vendorId: string;
  amount: number;
  creditDate?: Date;
  reason?: string;
  notes?: string;
  lineItems?: Array<{ description?: string; amount: number; accountId: string }>;
}) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');

  const credit = await prisma.vendorCredit.create({
    data: {
      number: `VC-${generateUniqueNumber()}`,
      vendorId: data.vendorId,
      amount: data.amount,
      remainingCredit: data.amount,
      creditDate: data.creditDate || new Date(),
      reason: data.reason,
      notes: data.notes,
      companyId: session.user.activeCompanyId,
      lineItems: data.lineItems
        ? { create: data.lineItems.map((item) => ({ description: item.description, amount: item.amount, accountId: item.accountId })) }
        : undefined,
    },
    include: { vendor: { select: { displayName: true } }, lineItems: true },
  });

  await prisma.vendor.update({
    where: { id: data.vendorId },
    data: { balance: { decrement: data.amount } },
  });

  revalidatePath(`/${session.activeCompany?.slug}/vendor-credits`);
  return { success: true, data: credit };
}

export async function deleteVendorCredits(ids: string[]) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');

  try {
    const credits = await prisma.vendorCredit.findMany({
      where: { id: { in: ids }, companyId: session.user.activeCompanyId },
      select: { id: true, vendorId: true, amount: true },
    });

    await prisma.vendorCredit.updateMany({
      where: { id: { in: ids }, companyId: session.user.activeCompanyId },
      data: { isActive: false, deactivatedAt: new Date(), deactivatedByUserId: session.user.id },
    });

    await Promise.all(credits.map(c =>
      prisma.vendor.update({
        where: { id: c.vendorId },
        data: { balance: { decrement: c.amount } },
      })
    ));

    revalidatePath(`/${session.activeCompany?.slug}/vendor-credits`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting vendor credits:', error);
    return { success: false, error: 'Failed to delete vendor credits' };
  }
}

export async function getVendorCreditStats() {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return null;

  const companyId = session.user.activeCompanyId;

  const [totalCredits, totalAmount, statusBreakdown] = await Promise.all([
    prisma.vendorCredit.count({ where: { companyId, isActive: true } }),
    prisma.vendorCredit.aggregate({
      where: { companyId, isActive: true },
      _sum: { amount: true },
    }),
    prisma.vendorCredit.groupBy({
      by: ['status'],
      where: { companyId, isActive: true },
      _count: { id: true },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalCredits,
    totalAmount: totalAmount._sum.amount || 0,
    statusBreakdown: statusBreakdown.reduce(
      (acc, s) => {
        acc[s.status] = { count: s._count.id, amount: s._sum.amount || 0 };
        return acc;
      },
      {} as Record<string, { count: number; amount: number }>
    ),
  };
}