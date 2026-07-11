'use server';
import { startOfDay, endOfDay } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { PurchaseStatus, PurchasePaymentType } from '@/lib/generated/prisma/enums';
import * as Prisma from '@/lib/generated/prisma/internal/prismaNamespace';
import { prisma } from '@/lib/prisma';
import { generateUniqueNumber } from '@/lib/utils';

export type PurchaseFilters = {
  status?: PurchaseStatus | undefined;
  vendorId?: string | undefined;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  search?: string | undefined;
};

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export type PurchaseBasic = Prisma.PurchaseGetPayload<{
  include: {
    vendor: {
      select: {
        displayName: true;
      };
    };
    lineItems: true;
  };
}>;

export type PurchaseWithRelations = Prisma.PurchaseGetPayload<{
  include: {
    vendor: {
      select: {
        id: true;
        displayName: true;
        primaryEmail: true;
        primaryPhone: true;
      };
    };
    lineItems: {
      include: {
        account: {
          select: {
            id: true;
            title: true;
            number: true;
          };
        };
        taxRate: {
          select: {
            id: true;
            name: true;
            rate: true;
          };
        };
      };
    };
  };
}>;

export type PurchaseStats = {
  totalPurchases: number;
  totalAmount: number;
  statusBreakdown: Record<string, { count: number; amount: number }>;
};

export async function getPurchasesPage(
  page: number = 1,
  pageSize: number = 10,
  filters: PurchaseFilters = {}
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
    where.txnDate = {};
    if (filters.dateFrom) where.txnDate.gte = startOfDay(filters.dateFrom);
    if (filters.dateTo) where.txnDate.lte = endOfDay(filters.dateTo);
  }
  if (filters.search) {
    where.vendor = {
      displayName: { contains: filters.search, mode: 'insensitive' },
    };
  }

  const [data, total] = await Promise.all([
    prisma.purchase.findMany({
      where,
      include: {
        vendor: { select: { displayName: true } },
        lineItems: true,
      },
      skip,
      take: validPageSize,
      orderBy: { txnDate: 'desc' },
    }),
    prisma.purchase.count({ where }),
  ]);

  const pageCount = Math.ceil(total / validPageSize);
  return { data, metadata: { total, page: validPage, pageSize: validPageSize, pageCount } };
}

export async function getPurchaseDetails(id: string) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');

  const purchase = await prisma.purchase.findFirst({
    where: { id, companyId: session.user.activeCompanyId, isActive: true },
    include: {
      vendor: {
        select: { id: true, displayName: true, primaryEmail: true, primaryPhone: true },
      },
      lineItems: {
        include: {
          account: { select: { id: true, title: true, number: true } },
          taxRate: { select: { id: true, name: true, rate: true } },
        },
      },
    },
  });
  return purchase;
}

export async function createPurchase(data: {
  vendorId: string;
  amount: number;
  accountRefId: string;
  paymentType: PurchasePaymentType;
  paymentMethod?: string;
  txnDate?: Date;
  privateNote?: string;
  notes?: string;
  credit?: boolean;
  classId?: string;
  departmentId?: string;
  lineItems?: Array<{
    description?: string;
    amount: number;
    accountId: string;
    taxable?: boolean;
    taxRateId?: string;
  }>;
}) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');

  const companyId = session.user.activeCompanyId;

  const purchase = await prisma.purchase.create({
    data: {
      number: `PUR-${generateUniqueNumber()}`,
      vendorId: data.vendorId,
      amount: data.amount,
      accountRefId: data.accountRefId,
      paymentType: data.paymentType,
      paymentMethod: data.paymentMethod as any,
      txnDate: data.txnDate || new Date(),
      privateNote: data.privateNote,
      notes: data.notes,
      credit: data.credit ?? false,
      classId: data.classId,
      departmentId: data.departmentId,
      companyId,
      lineItems: data.lineItems ? {
        create: data.lineItems.map(item => ({
          description: item.description,
          amount: item.amount,
          accountId: item.accountId,
          taxable: item.taxable ?? true,
          taxRateId: item.taxRateId,
        })),
      } : undefined,
    },
    include: {
      vendor: { select: { displayName: true } },
      lineItems: true,
    },
  });

  await prisma.vendor.update({
    where: { id: data.vendorId },
    data: { balance: { increment: data.amount } },
  });

  revalidatePath(`/${session.activeCompany?.slug}/purchases`);
  return { success: true, data: purchase };
}

export async function deletePurchases(ids: string[]) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');

  try {
    const purchases = await prisma.purchase.findMany({
      where: { id: { in: ids }, companyId: session.user.activeCompanyId },
      select: { id: true, amount: true, vendorId: true },
    });

    await prisma.purchase.updateMany({
      where: { id: { in: ids }, companyId: session.user.activeCompanyId },
      data: { isActive: false, deactivatedAt: new Date(), deactivatedByUserId: session.user.id },
    });

    await Promise.all(purchases.map(purchase =>
      prisma.vendor.update({
        where: { id: purchase.vendorId },
        data: { balance: { decrement: purchase.amount } },
      })
    ));

    revalidatePath(`/${session.activeCompany?.slug}/purchases`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete purchases' };
  }
}

export async function getPurchaseStats(): Promise<PurchaseStats> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) return { totalPurchases: 0, totalAmount: 0, statusBreakdown: {} };
  if (!session?.user?.activeCompanyId) return { totalPurchases: 0, totalAmount: 0, statusBreakdown: {} };

  const companyId = session.user.activeCompanyId;
  const purchases = await prisma.purchase.findMany({
    where: { companyId, isActive: true },
    select: { amount: true, status: true },
  });

  const totalAmount = purchases.reduce((sum, p) => sum + p.amount, 0);
  const statusBreakdown: Record<string, { count: number; amount: number }> = {};

  for (const p of purchases) {
    if (!statusBreakdown[p.status]) {
      statusBreakdown[p.status] = { count: 0, amount: 0 };
    }
    const sb = statusBreakdown[p.status]!;
    sb.count++;
    sb.amount += p.amount;
  }

  return { totalPurchases: purchases.length, totalAmount, statusBreakdown };
}