'use server';

import { startOfDay, endOfDay } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {  getSessionWithCompany } from '@/lib/auth';
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

export type PaymentBasic = Prisma.PaymentGetPayload<{
  include: {
    customer: {
      select: {
        displayName: true;
        primaryEmail: true;
      };
    };
    invoice: {
      select: {
        number: true;
        amount: true;
        status: true;
      };
    };
  };
}>;

export type PaymentWithRelations = Prisma.PaymentGetPayload<{
  include: {
    customer: {
      select: {
        displayName: true;
        primaryEmail: true;
      };
    };
    invoice: {
      select: {
        id: true;
        number: true;
        amount: true;
        status: true;
        dueDate: true;
      };
    };
    Transaction: {
      select: {
        id: true;
        type: true;
        status: true;
        date: true;
        categoryId: true;
        referenceNumber: true;
      };
    };
  };
}>;

export async function getPaymentsPage(
  page: number = 1,
  pageSize: number = 10,
  filters: PaymentFilters = {}
) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) {
    redirect('/login');
  }
  if (!session?.user?.activeCompanyId) {
    redirect('/select-company');
  }
  const validPage = Math.max(1, page);
  const validPageSize = Math.min(Math.max(1, pageSize), 100);
  const skip = (validPage - 1) * validPageSize;

  const where: Prisma.PaymentWhereInput = {
    companyId: session.user.activeCompanyId,
    isActive: true
  };

  if (filters.method && Object.values(PaymentMethod).includes(filters.method)) {
    where.paymentMethod = filters.method;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.paymentDate = {};
    if (filters.dateFrom) where.paymentDate.gte = startOfDay(filters.dateFrom);
    if (filters.dateTo) where.paymentDate.lte = endOfDay(filters.dateTo);
  }

  if (filters.search?.trim()) {
    where.OR = [
      { reference: { contains: filters.search.trim(), mode: 'insensitive' } },
      {
        customer: {
          displayName: {
            contains: filters.search.trim(),
            mode: 'insensitive'
          }
        }
      },
      {
        invoice: {
          number: { contains: filters.search.trim(), mode: 'insensitive' }
        }
      }
    ];
  }

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      include: {
        customer: {
          select: {
            displayName: true,
            primaryEmail: true
          }
        },
        invoice: {
          select: {
            number: true,
            amount: true,
            status: true
          }
        }
      },
      orderBy: { paymentDate: 'desc' },
      skip,
      take: validPageSize
    })
  ]);

  return {
    data: payments,
    metadata: {
      total,
      page: validPage,
      pageSize: validPageSize,
      pageCount: Math.ceil(total / validPageSize)
    }
  };
}

export async function getPaymentStats() {
  try {
    const [totalCount, totalAmount, methodBreakdown, dailyTrend] =
      await Promise.all([
        prisma.payment.count({
          where: { isActive: true }
        }),
        prisma.payment.aggregate({
          _sum: {
            amount: true
          },
          where: { isActive: true }
        }),
        prisma.payment.groupBy({
          by: ['paymentMethod'],
          _count: true,
          _sum: {
            amount: true
          },
          where: { isActive: true }
        }),
        prisma.payment.groupBy({
          by: ['paymentDate'],
          _sum: {
            amount: true
          },
          orderBy: {
            paymentDate: 'desc'
          },
          take: 30, // Last 30 days
          where: { isActive: true }
        })
      ]);

    const methodStats = methodBreakdown.reduce(
      (acc, { paymentMethod, _count, _sum }) => {
        acc[paymentMethod] = {
          count: _count,
          amount: Number(_sum.amount || 0)
        };
        return acc;
      },
      {} as Record<PaymentMethod, { count: number; amount: number }>
    );

    const dailyStats = dailyTrend.map((day) => ({
      date: day.paymentDate,
      amount: Number(day._sum.amount || 0)
    }));

    return {
      totalPayments: totalCount,
      totalAmount: Number(totalAmount._sum.amount || 0),
      methodBreakdown: methodStats,
      dailyTrend: dailyStats,
      averagePayment:
        totalCount > 0 ? Number(totalAmount._sum.amount || 0) / totalCount : 0
    };
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    throw new Error('Failed to fetch payment statistics', { cause: error });
  }
}

export async function getPaymentDetails(
  id: string
): Promise<PaymentWithRelations | null> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) {
    redirect('/login');
  }
  if (!session?.user?.activeCompanyId) {
    redirect('/select-company');
  }
  return prisma.payment.findUnique({
    where: {
      id,
      companyId: session.user.activeCompanyId,
      isActive: true
    },
    include: {
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
          status: true,
          dueDate: true
        }
      },
      Transaction: {
        select: {
          id: true,
          type: true,
          status: true,
          date: true,
          categoryId: true,
          referenceNumber: true
        }
      }
    }
  });
}

export async function deletePayments(ids: string[]): Promise<DeleteResult> {
  console.log('Deactivating payments:', ids);
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return {
      success: false,
      error: 'No payments selected for deactivation'
    };
  }

  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Check for payments that can't be deleted
    const nonDeletablePayments = await prisma.payment.findMany({
      where: {
        id: { in: ids },
        isActive: true,
        Transaction: {
          some: {} // Has any transactions
        }
      },
      select: {
        id: true,
        invoice: {
          select: {
            number: true
          }
        }
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

    // Get the invoices that need to be updated
    const affectedInvoices = await prisma.payment.findMany({
      where: {
        id: { in: ids },
        isActive: true
      },
      select: {
        invoiceId: true
      }
    });

    // Use a transaction to ensure all operations succeed or none do
    await prisma.$transaction(async (tx) => {
      // 1. Soft delete the payments by updating isActive to false
      await tx.payment.updateMany({
        where: {
          id: { in: ids },
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Payment deactivated by user'
        }
      });

      // 2. Update invoice statuses - only count active payments
      for (const { invoiceId } of affectedInvoices) {
        const remainingPayments = await tx.payment.aggregate({
          where: {
            invoiceId,
            isActive: true
          },
          _sum: {
            amount: true
          }
        });

        const invoice = await tx.invoice.findUnique({
          where: { id: invoiceId },
          select: { amount: true }
        });

        if (invoice) {
          const totalPaid = Number(remainingPayments._sum.amount || 0);
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

    // Revalidate affected pages
    revalidatePath('/payments');
    revalidatePath('/invoices');

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deactivating payments:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to deactivate payments'
    };
  }
}
