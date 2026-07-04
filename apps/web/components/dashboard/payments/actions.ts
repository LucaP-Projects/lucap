'use server';

import { startOfDay, endOfDay } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { PaymentMethod } from '@/lib/generated/prisma/enums';
import * as Prisma from '@/lib/generated/prisma/internal/prismaNamespace';
import { prisma } from '@/lib/prisma';

export type PaymentFilters = {
  method?: PaymentMethod | undefined;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  search?: string | undefined;
};

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export type PaymentBasic = {
  id: string;
  number: string;
  status: 'COMPLETED';
  customer: {
    displayName: string;
    primaryEmail: string | null;
  };
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  createdAt: Date;
};

export type PaymentWithRelations = {
  id: string;
  number: string;
  status: 'COMPLETED';
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  reference: string | null;
  discountType: string | null;
  discountValue: number | null;
  discountAmount: number;
  customer: {
    displayName: string;
    primaryEmail: string | null;
  };
  invoice: {
    id: string;
    number: string;
    amount: number;
    status: string;
  };
  createdAt: Date;
};

const toPaymentNumber = (payment: { id: string; reference: string | null }) =>
  payment.reference || `PMT-${payment.id.slice(-8).toUpperCase()}`;

export async function getPaymentsPage(
  page: number = 1,
  pageSize: number = 10,
  filters: PaymentFilters = {}
) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }
  if (!session?.user?.activeCompanyId) {
    redirect('/select-company');
  }

  const skip = (page - 1) * pageSize;

  const where: Prisma.PaymentWhereInput = {
    companyId: session.user.activeCompanyId,
    isActive: true
  };

  if (filters.method) {
    where.paymentMethod = filters.method;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.paymentDate = {};
    if (filters.dateFrom) where.paymentDate.gte = startOfDay(filters.dateFrom);
    if (filters.dateTo) where.paymentDate.lte = endOfDay(filters.dateTo);
  }

  if (filters.search?.trim()) {
    const search = filters.search.trim();
    where.OR = [
      { reference: { contains: search, mode: 'insensitive' } },
      { customer: { displayName: { contains: search, mode: 'insensitive' } } },
      { invoice: { number: { contains: search, mode: 'insensitive' } } }
    ];
  }

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      select: {
        id: true,
        reference: true,
        amount: true,
        paymentMethod: true,
        paymentDate: true,
        createdAt: true,
        customer: {
          select: {
            displayName: true,
            primaryEmail: true
          }
        }
      },
      orderBy: { paymentDate: 'desc' },
      skip,
      take: pageSize
    })
  ]);

  const data: PaymentBasic[] = payments.map((payment) => ({
    id: payment.id,
    number: toPaymentNumber(payment),
    status: 'COMPLETED',
    customer: payment.customer,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    paymentDate: payment.paymentDate,
    createdAt: payment.createdAt
  }));

  return {
    data,
    metadata: {
      total,
      pageCount: Math.ceil(total / pageSize),
      currentPage: page
    }
  };
}

export async function getPaymentStats() {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }
  if (!session?.user?.activeCompanyId) {
    redirect('/select-company');
  }

  const where: Prisma.PaymentWhereInput = {
    companyId: session.user.activeCompanyId,
    isActive: true
  };

  const [totals, methodGroups] = await Promise.all([
    prisma.payment.aggregate({
      where,
      _sum: { amount: true },
      _count: { _all: true }
    }),
    prisma.payment.groupBy({
      by: ['paymentMethod'],
      where,
      _count: { _all: true },
      _sum: { amount: true }
    })
  ]);

  const methodBreakdown: Record<PaymentMethod, { count: number; amount: number }> = {
    CASH: { count: 0, amount: 0 },
    CREDIT_CARD: { count: 0, amount: 0 },
    BANK_TRANSFER: { count: 0, amount: 0 },
    CHECK: { count: 0, amount: 0 },
    DIGITAL_WALLET: { count: 0, amount: 0 },
    MOBILE_PAYMENT: { count: 0, amount: 0 },
    OTHER: { count: 0, amount: 0 }
  };

  methodGroups.forEach((group) => {
    methodBreakdown[group.paymentMethod] = {
      count: group._count._all,
      amount: group._sum.amount || 0
    };
  });

  const totalAmount = totals._sum.amount || 0;
  const totalPayments = totals._count._all;

  return {
    totalPayments,
    totalAmount,
    averagePayment: totalPayments > 0 ? totalAmount / totalPayments : 0,
    methodBreakdown
  };
}

export async function getPaymentDetails(
  id: string
): Promise<PaymentWithRelations | null> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }
  if (!session?.user?.activeCompanyId) {
    redirect('/select-company');
  }

  const payment = await prisma.payment.findFirst({
    where: {
      id,
      companyId: session.user.activeCompanyId,
      isActive: true
    },
    select: {
      id: true,
      reference: true,
      amount: true,
      paymentMethod: true,
      paymentDate: true,
      discountType: true,
      discountValue: true,
      discountAmount: true,
      createdAt: true,
      customer: {
        select: {
          displayName: true,
          primaryEmail: true
        }
      },
      invoice: {
        select: {
          id: true,
          number: true,
          amount: true,
          status: true
        }
      }
    }
  });

  if (!payment) return null;

  return {
    id: payment.id,
    number: toPaymentNumber(payment),
    status: 'COMPLETED',
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    paymentDate: payment.paymentDate,
    reference: payment.reference,
    discountType: payment.discountType,
    discountValue: payment.discountValue,
    discountAmount: payment.discountAmount,
    customer: payment.customer,
    invoice: payment.invoice,
    createdAt: payment.createdAt
  };
}

export async function deletePayments(ids: string[]): Promise<DeleteResult> {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return {
      success: false,
      error: 'No payments selected for deactivation'
    };
  }

  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return { success: false, error: 'Authentication required' };
    }
    if (!session?.user?.activeCompanyId) {
      return { success: false, error: 'No active company' };
    }

    const nonDeletablePayments = await prisma.payment.findMany({
      where: {
        id: { in: ids },
        companyId: session.user.activeCompanyId,
        isActive: true,
        transactions: { some: {} }
      },
      select: {
        id: true,
        invoice: { select: { number: true } }
      }
    });

    if (nonDeletablePayments.length > 0) {
      return {
        success: false,
        error: `Cannot deactivate payments that have associated transactions for invoices: ${nonDeletablePayments
          .map((p) => p.invoice.number)
          .join(', ')}`
      };
    }

    const affectedInvoices = await prisma.payment.findMany({
      where: {
        id: { in: ids },
        companyId: session.user.activeCompanyId,
        isActive: true
      },
      select: { invoiceId: true }
    });

    await prisma.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: {
          id: { in: ids },
          companyId: session.user.activeCompanyId,
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Payment deactivated by user'
        }
      });

      for (const { invoiceId } of affectedInvoices) {
        const remainingPayments = await tx.payment.aggregate({
          where: { invoiceId, isActive: true },
          _sum: { amount: true }
        });

        const invoice = await tx.invoice.findUnique({
          where: { id: invoiceId },
          select: { amount: true }
        });

        if (invoice) {
          const totalPaid = remainingPayments._sum.amount || 0;
          const newStatus =
            totalPaid === 0
              ? 'PENDING'
              : totalPaid < invoice.amount
                ? 'PARTIAL'
                : 'PAID';

          await tx.invoice.update({
            where: { id: invoiceId },
            data: { status: newStatus }
          });
        }
      }
    });

    revalidatePath('/payments');
    revalidatePath('/invoices');

    return { success: true };
  } catch (error) {
    console.error('Error deactivating payments:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to deactivate payments'
    };
  }
}
