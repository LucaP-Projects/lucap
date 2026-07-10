'use server';
import { startOfDay, endOfDay } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { PurchaseOrderStatus } from '@/lib/generated/prisma/enums';
import * as Prisma from '@/lib/generated/prisma/internal/prismaNamespace';
import { prisma } from '@/lib/prisma';

export type PurchaseOrderFilters = {
  status?: PurchaseOrderStatus | undefined;
  vendorId?: string | undefined;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  search?: string | undefined;
};

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export type PurchaseOrderBasic = Prisma.PurchaseOrderGetPayload<{
  include: {
    vendor: {
      select: {
        displayName: true;
      };
    };
    lineItems: true;
  };
}>;

export type PurchaseOrderWithRelations = Prisma.PurchaseOrderGetPayload<{
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

export type PurchaseOrderStats = {
  totalOrders: number;
  totalAmount: number;
  statusBreakdown: Record<string, { count: number; amount: number }>;
};

export async function getPurchaseOrdersPage(
  page: number = 1,
  pageSize: number = 10,
  filters: PurchaseOrderFilters = {}
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
    prisma.purchaseOrder.findMany({
      where,
      include: {
        vendor: { select: { displayName: true } },
        lineItems: true,
      },
      skip,
      take: validPageSize,
      orderBy: { txnDate: 'desc' },
    }),
    prisma.purchaseOrder.count({ where }),
  ]);

  const pageCount = Math.ceil(total / validPageSize);
  return { data, metadata: { total, page: validPage, pageSize: validPageSize, pageCount } };
}

export async function getPurchaseOrderDetails(id: string) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');

  const order = await prisma.purchaseOrder.findFirst({
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
  return order;
}

export async function createPurchaseOrder(data: {
  vendorId: string;
  amount: number;
  dueDate?: Date;
  txnDate?: Date;
  memo?: string;
  poEmail?: string;
  apAccountRefId?: string;
  classId?: string;
  departmentId?: string;
  termId?: string;
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

  const order = await prisma.purchaseOrder.create({
    data: {
      number: `PO-${Date.now()}`,
      vendorId: data.vendorId,
      amount: data.amount,
      dueDate: data.dueDate,
      txnDate: data.txnDate || new Date(),
      memo: data.memo,
      poEmail: data.poEmail,
      apAccountRefId: data.apAccountRefId,
      classId: data.classId,
      departmentId: data.departmentId,
      termId: data.termId,
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

  revalidatePath(`/${session.activeCompany?.slug}/purchase-orders`);
  return { success: true, data: order };
}

export async function deletePurchaseOrders(ids: string[]) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');

  try {
    await prisma.purchaseOrder.updateMany({
      where: { id: { in: ids }, companyId: session.user.activeCompanyId },
      data: { isActive: false, deactivatedAt: new Date(), deactivatedByUserId: session.user.id },
    });

    revalidatePath(`/${session.activeCompany?.slug}/purchase-orders`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete purchase orders' };
  }
}

export async function getPurchaseOrderStats(): Promise<PurchaseOrderStats> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) return { totalOrders: 0, totalAmount: 0, statusBreakdown: {} };
  if (!session?.user?.activeCompanyId) return { totalOrders: 0, totalAmount: 0, statusBreakdown: {} };

  const companyId = session.user.activeCompanyId;
  const orders = await prisma.purchaseOrder.findMany({
    where: { companyId, isActive: true },
    select: { amount: true, status: true },
  });

  const totalAmount = orders.reduce((sum, o) => sum + o.amount, 0);
  const statusBreakdown: Record<string, { count: number; amount: number }> = {};

  for (const o of orders) {
    if (!statusBreakdown[o.status]) {
      statusBreakdown[o.status] = { count: 0, amount: 0 };
    }
    const sb = statusBreakdown[o.status]!;
    sb.count++;
    sb.amount += o.amount;
  }

  return { totalOrders: orders.length, totalAmount, statusBreakdown };
}