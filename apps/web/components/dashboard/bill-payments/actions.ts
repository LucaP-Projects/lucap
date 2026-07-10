'use server';
import { startOfDay, endOfDay } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { PaymentMethod } from '@/lib/generated/prisma/enums';
import * as Prisma from '@/lib/generated/prisma/internal/prismaNamespace';
import { prisma } from '@/lib/prisma';

export type BillPaymentFilters = {
  vendorId?: string | undefined;
  paymentMethod?: PaymentMethod | undefined;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  search?: string | undefined;
};

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export type BillPaymentBasic = Prisma.BillPaymentGetPayload<{
  include: {
    vendor: {
      select: {
        displayName: true;
      };
    };
    allocations: {
      select: {
        amount: true;
        billId: true;
        bill: {
          select: {
            number: true;
          };
        };
      };
    };
  };
}>;

export type BillPaymentWithRelations = Prisma.BillPaymentGetPayload<{
  include: {
    vendor: {
      select: {
        id: true;
        displayName: true;
        primaryEmail: true;
      };
    };
    allocations: {
      include: {
        bill: {
          select: {
            id: true;
            number: true;
            amount: true;
            dueDate: true;
          };
        };
      };
    };
  };
}>;

export type BillPaymentStats = {
  totalPayments: number;
  totalAmount: number;
  paymentCount: number;
};

export async function getBillPaymentsPage(
  page: number = 1,
  pageSize: number = 10,
  filters: BillPaymentFilters = {}
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

  if (filters.vendorId) where.vendorId = filters.vendorId;
  if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;
  if (filters.dateFrom || filters.dateTo) {
    where.paymentDate = {};
    if (filters.dateFrom) where.paymentDate.gte = startOfDay(filters.dateFrom);
    if (filters.dateTo) where.paymentDate.lte = endOfDay(filters.dateTo);
  }
  if (filters.search) {
    where.vendor = {
      displayName: { contains: filters.search, mode: 'insensitive' },
    };
  }

  const [data, total] = await Promise.all([
    prisma.billPayment.findMany({
      where,
      include: {
        vendor: { select: { displayName: true } },
        allocations: {
          select: {
            amount: true,
            billId: true,
            bill: { select: { number: true } },
          },
        },
      },
      skip,
      take: validPageSize,
      orderBy: { paymentDate: 'desc' },
    }),
    prisma.billPayment.count({ where }),
  ]);

  const pageCount = Math.ceil(total / validPageSize);
  return { data, metadata: { total, page: validPage, pageSize: validPageSize, pageCount } };
}

export async function getBillPaymentDetails(id: string) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');

  const payment = await prisma.billPayment.findFirst({
    where: { id, companyId: session.user.activeCompanyId, isActive: true },
    include: {
      vendor: { select: { id: true, displayName: true, primaryEmail: true } },
      allocations: {
        include: {
          bill: { select: { id: true, number: true, amount: true, dueDate: true, status: true } },
        },
      },
    },
  });
  return payment;
}

export async function createBillPayment(data: {
  vendorId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  allocations: Array<{
    billId: string;
    amount: number;
  }>;
}) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');

  const companyId = session.user.activeCompanyId;

  const payment = await prisma.billPayment.create({
    data: {
      vendorId: data.vendorId,
      amount: data.amount,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      reference: data.reference,
      notes: data.notes,
      companyId,
      allocations: {
        create: data.allocations.map(a => ({
          billId: a.billId,
          amount: a.amount,
        })),
      },
    },
    include: {
      allocations: true,
    },
  });

  await prisma.vendor.update({
    where: { id: data.vendorId },
    data: { balance: { decrement: data.amount } },
  });

  for (const allocation of data.allocations) {
    const bill = await prisma.bill.findUnique({ where: { id: allocation.billId } });
    if (bill) {
      const totalPaidOnBill = data.allocations
        .filter(a => a.billId === allocation.billId)
        .reduce((sum, a) => sum + a.amount, 0);
      const existingPaid = await prisma.billPaymentAllocation.aggregate({
        where: { billId: allocation.billId, billPayment: { isActive: true } },
        _sum: { amount: true },
      });
      const totalPaid = (existingPaid._sum.amount || 0) + totalPaidOnBill;

      let newStatus: string;
      if (totalPaid >= bill.amount) {
        newStatus = 'PAID';
      } else if (totalPaid > 0) {
        newStatus = 'PARTIALLY_PAID';
      } else {
        newStatus = bill.dueDate < new Date() ? 'OVERDUE' : 'OPEN';
      }

      await prisma.bill.update({
        where: { id: allocation.billId },
        data: { status: newStatus as any },
      });
    }
  }

  revalidatePath(`/${session.activeCompany?.slug}/bill-payments`);
  revalidatePath(`/${session.activeCompany?.slug}/bills`);
  return { success: true, data: payment };
}

export async function deleteBillPayments(ids: string[]) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');

  try {
    const payments = await prisma.billPayment.findMany({
      where: { id: { in: ids }, companyId: session.user.activeCompanyId },
      select: { id: true, amount: true, vendorId: true },
    });

    await prisma.billPayment.updateMany({
      where: { id: { in: ids }, companyId: session.user.activeCompanyId },
      data: { isActive: false, deactivatedAt: new Date(), deactivatedByUserId: session.user.id },
    });

    await Promise.all(payments.map(p =>
      prisma.vendor.update({
        where: { id: p.vendorId },
        data: { balance: { decrement: p.amount } },
      })
    ));

    revalidatePath(`/${session.activeCompany?.slug}/bill-payments`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete bill payments' };
  }
}

export async function getBillPaymentStats(): Promise<BillPaymentStats> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) return { totalPayments: 0, totalAmount: 0, paymentCount: 0 };
  if (!session?.user?.activeCompanyId) return { totalPayments: 0, totalAmount: 0, paymentCount: 0 };

  const companyId = session.user.activeCompanyId;
  const agg = await prisma.billPayment.aggregate({
    where: { companyId, isActive: true },
    _count: true,
    _sum: { amount: true },
  });

  return {
    totalPayments: agg._count,
    totalAmount: agg._sum.amount || 0,
    paymentCount: agg._count,
  };
}
