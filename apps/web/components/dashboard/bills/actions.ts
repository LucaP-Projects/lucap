'use server';
import { startOfDay, endOfDay } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { BillStatus } from '@/lib/generated/prisma/enums';
import * as Prisma from '@/lib/generated/prisma/internal/prismaNamespace';
import { prisma } from '@/lib/prisma';

export type BillFilters = {
  status?: BillStatus | undefined;
  vendorId?: string | undefined;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  search?: string | undefined;
};

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export type BillBasic = Prisma.BillGetPayload<{
  include: {
    vendor: {
      select: {
        displayName: true;
        primaryEmail: true;
      };
    };
    lineItems: true;
    allocations: {
      select: {
        amount: true;
      };
    };
  };
}>;

export type BillWithRelations = Prisma.BillGetPayload<{
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
    allocations: {
      include: {
        billPayment: {
          select: {
            id: true;
            paymentDate: true;
            paymentMethod: true;
            reference: true;
          };
        };
      };
    };
  };
}>;

export type BillStats = {
  totalBills: number;
  totalAmount: number;
  totalPaid: number;
  outstandingAmount: number;
  overdueAmount: number;
  statusBreakdown: Record<string, { count: number; amount: number }>;
};

export async function getBillsPage(
  page: number = 1,
  pageSize: number = 10,
  filters: BillFilters = {}
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
    where.billDate = {};
    if (filters.dateFrom) where.billDate.gte = startOfDay(filters.dateFrom);
    if (filters.dateTo) where.billDate.lte = endOfDay(filters.dateTo);
  }
  if (filters.search) {
    where.vendor = {
      displayName: { contains: filters.search, mode: 'insensitive' },
    };
  }

  const [data, total] = await Promise.all([
    prisma.bill.findMany({
      where,
      include: {
        vendor: { select: { displayName: true, primaryEmail: true } },
        lineItems: true,
        allocations: { select: { amount: true } },
      },
      skip,
      take: validPageSize,
      orderBy: { billDate: 'desc' },
    }),
    prisma.bill.count({ where }),
  ]);

  const pageCount = Math.ceil(total / validPageSize);
  return { data, metadata: { total, page: validPage, pageSize: validPageSize, pageCount } };
}

export async function getBillDetails(id: string) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');

  const bill = await prisma.bill.findFirst({
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
      allocations: {
        include: {
          billPayment: {
            select: { id: true, paymentDate: true, paymentMethod: true, reference: true },
          },
        },
      },
    },
  });
  return bill;
}

export async function createBill(data: {
  vendorId: string;
  amount: number;
  dueDate: Date;
  billDate?: Date;
  notes?: string;
  memo?: string;
  taxRate?: number;
  taxAmount?: number;
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

  const bill = await prisma.bill.create({
    data: {
      number: `BILL-${Date.now()}`,
      vendorId: data.vendorId,
      amount: data.amount,
      dueDate: data.dueDate,
      billDate: data.billDate || new Date(),
      notes: data.notes,
      memo: data.memo,
      taxRate: data.taxRate || 0,
      taxAmount: data.taxAmount || 0,
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

  revalidatePath(`/${session.activeCompany?.slug}/bills`);
  return { success: true, data: bill };
}

export async function updateBillStatus(id: string, status: BillStatus) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');

  const bill = await prisma.bill.update({
    where: { id, companyId: session.user.activeCompanyId },
    data: { status },
  });
  revalidatePath(`/${session.activeCompany?.slug}/bills`);
  return { success: true, data: bill };
}

export async function deleteBills(ids: string[]) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');

  try {
    const bills = await prisma.bill.findMany({
      where: { id: { in: ids }, companyId: session.user.activeCompanyId },
      select: { id: true, amount: true, vendorId: true },
    });

    await prisma.bill.updateMany({
      where: { id: { in: ids }, companyId: session.user.activeCompanyId },
      data: { isActive: false, deactivatedAt: new Date(), deactivatedByUserId: session.user.id },
    });

    await Promise.all(bills.map(bill =>
      prisma.vendor.update({
        where: { id: bill.vendorId },
        data: { balance: { decrement: bill.amount } },
      })
    ));

    revalidatePath(`/${session.activeCompany?.slug}/bills`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete bills' };
  }
}

export async function getBillStats(): Promise<BillStats> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) return { totalBills: 0, totalAmount: 0, totalPaid: 0, outstandingAmount: 0, overdueAmount: 0, statusBreakdown: {} };
  if (!session?.user?.activeCompanyId) return { totalBills: 0, totalAmount: 0, totalPaid: 0, outstandingAmount: 0, overdueAmount: 0, statusBreakdown: {} };

  const companyId = session.user.activeCompanyId;
  const bills = await prisma.bill.findMany({
    where: { companyId, isActive: true },
    select: { amount: true, status: true, dueDate: true },
  });

  const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0);
  const statusBreakdown: Record<string, { count: number; amount: number }> = {};

  let totalPaid = 0;
  let outstandingAmount = 0;
  let overdueAmount = 0;

  for (const bill of bills) {
    if (!statusBreakdown[bill.status]) {
      statusBreakdown[bill.status] = { count: 0, amount: 0 };
    }
    const sb = statusBreakdown[bill.status]!;
    sb.count++;
    sb.amount += bill.amount;

    if (bill.status === 'PAID') {
      totalPaid += bill.amount;
    } else if (bill.status !== 'VOID') {
      outstandingAmount += bill.amount;
      if (bill.dueDate < new Date()) {
        overdueAmount += bill.amount;
      }
    }
  }

  return {
    totalBills: bills.length,
    totalAmount,
    totalPaid,
    outstandingAmount,
    overdueAmount,
    statusBreakdown,
  };
}
