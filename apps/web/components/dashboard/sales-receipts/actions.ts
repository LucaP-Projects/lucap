'use server';
import { startOfDay, endOfDay } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ReceiptStatus, Prisma, PaymentMethod } from '@/lib/generated/prisma/client';

export type SalesReceiptFilters = {
  status?: ReceiptStatus | undefined;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  search?: string | undefined;
};

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export type SalesReceiptBasic = {
  id: string;
  number: string;
  status: ReceiptStatus;
  customer: {
    displayName: string;
    primaryEmail: string | null;
  };
  amount: number;
  taxAmount: number;
  paymentMethod: PaymentMethod;
  paymentRef: string | null;
  emailCustomer: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SalesReceiptWithRelations = Prisma.SalesReceiptGetPayload<{
  include: {
    customer: {
      select: {
        displayName: true;
        primaryEmail: true;
      };
    };
    items: true;
    attachments: {
      include: {
        file: {
          select: {
            id: true;
            filename: true;
            path: true;
            mimetype: true;
          };
        };
      };
    };
    Transaction: {
      select: {
        id: true;
        type: true;
        amount: true;
        status: true;
        date: true;
      };
    };
  };
}>;

export async function getSalesReceiptsPage(
  page: number = 1,
  pageSize: number = 10,
  filters: SalesReceiptFilters = {}
) {
  const validPage = Math.max(1, page);
  const validPageSize = Math.min(Math.max(1, pageSize), 100);
  const skip = (validPage - 1) * validPageSize;

  const where: Prisma.SalesReceiptWhereInput = {
    isActive: true
  };

  if (filters.status && Object.values(ReceiptStatus).includes(filters.status)) {
    where.status = filters.status;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = startOfDay(filters.dateFrom);
    if (filters.dateTo) where.createdAt.lte = endOfDay(filters.dateTo);
  }

  if (filters.search?.trim()) {
    where.OR = [
      { number: { contains: filters.search.trim(), mode: 'insensitive' } },
      {
        customer: {
          displayName: {
            contains: filters.search.trim(),
            mode: 'insensitive'
          }
        }
      },
      // Add search by payment reference
      { paymentRef: { contains: filters.search.trim(), mode: 'insensitive' } }
    ];
  }

  const [total, salesReceipts] = await Promise.all([
    db.salesReceipt.count({ where }),
    db.salesReceipt.findMany({
      where,
      include: {
        customer: {
          select: {
            displayName: true,
            primaryEmail: true
          }
        },
        items: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: validPageSize
    })
  ]);

  return {
    data: salesReceipts,
    metadata: {
      total,
      page: validPage,
      pageSize: validPageSize,
      pageCount: Math.ceil(total / validPageSize)
    }
  };
}

export async function getSalesReceiptStats() {
  try {
    const [totalCount, totals, statusBreakdown, paymentMethodBreakdown] =
      await Promise.all([
        db.salesReceipt.count({ where: { isActive: true } }),
        db.salesReceipt.aggregate({
          where: { isActive: true },
          _sum: {
            taxAmount: true,
            amount: true
          }
        }),
        db.salesReceipt.groupBy({
          where: { isActive: true },
          by: ['status'],
          _count: true,
          _sum: {
            amount: true
          }
        }),
        db.salesReceipt.groupBy({
          where: { isActive: true },
          by: ['paymentMethod'],
          _count: true,
          _sum: {
            amount: true
          }
        })
      ]);

    const initialStatusBreakdown: Record<
      ReceiptStatus,
      { count: number; amount: number }
    > = {
      COMPLETED: { count: 0, amount: 0 },
      VOIDED: { count: 0, amount: 0 },
      REFUNDED: { count: 0, amount: 0 }
    };

    // Update with actual counts and amounts
    statusBreakdown.forEach(({ status, _count, _sum }) => {
      if (status in initialStatusBreakdown) {
        initialStatusBreakdown[status as ReceiptStatus] = {
          count: _count,
          amount: Number(_sum.amount || 0)
        };
      }
    });
    const total = totals._sum.amount || 0;
    const tax = totals._sum.taxAmount || 0;
    return {
      totalReceipts: totalCount,
      totals: {
        subtotal: Number(total - tax || 0),
        tax: Number(totals._sum.taxAmount || 0),
        total: Number(totals._sum.amount || 0)
      },
      statusBreakdown: initialStatusBreakdown,
      paymentMethods: paymentMethodBreakdown.map(
        ({ paymentMethod, _count, _sum }) => ({
          method: paymentMethod,
          count: _count,
          amount: Number(_sum.amount || 0)
        })
      )
    };
  } catch (error) {
    console.error('Error fetching sales receipt stats:', error);
    throw new Error('Failed to fetch sales receipt statistics');
  }
}

export async function getSalesReceiptDetails(
  id: string
): Promise<SalesReceiptWithRelations | null> {
  return db.salesReceipt.findUnique({
    where: {
      id,
      isActive: true
    },
    include: {
      customer: {
        select: {
          displayName: true,
          primaryEmail: true
        }
      },
      items: {
        where: { isActive: true }
      },
      attachments: {
        where: { isActive: true },
        include: {
          file: {
            select: {
              id: true,
              filename: true,
              path: true,
              mimetype: true
            }
          }
        }
      },
      Transaction: {
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          date: true
        }
      }
    }
  });
}

export async function deleteSalesReceipts(
  ids: string[]
): Promise<DeleteResult> {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return {
      success: false,
      error: 'No sales receipts selected for deletion'
    };
  }

  try {
    // Get the current session for user ID
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Check for receipts that can't be deleted
    const nonDeletableReceipts = await prisma.salesReceipt.findMany({
      where: {
        id: { in: ids },
        isActive: true,
        OR: [
          { status: 'REFUNDED' },
          { Transaction: { some: {} } } // Has any transactions
        ]
      },
      select: {
        number: true,
        status: true
      }
    });

    if (nonDeletableReceipts.length > 0) {
      return {
        success: false,
        error: `Cannot delete receipts that have been refunded or have associated transactions: ${nonDeletableReceipts
          .map((r) => r.number)
          .join(', ')}`
      };
    }

    // Use a transaction to ensure all operations succeed or none do
    await prisma.$transaction(async (tx) => {
      // 1. Soft delete receipt attachments
      await tx.receiptAttachment.updateMany({
        where: {
          receiptId: {
            in: ids
          },
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent sales receipt deactivated'
        }
      });

      // 2. Soft delete receipt items
      await tx.salesReceiptItem.updateMany({
        where: {
          receiptId: {
            in: ids
          },
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent sales receipt deactivated'
        }
      });

      // 3. Soft delete the receipts themselves
      await tx.salesReceipt.updateMany({
        where: {
          id: {
            in: ids
          },
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Sales receipt deactivated by user'
        }
      });
    });

    // Revalidate the sales receipts page
    revalidatePath('/sales-receipts');

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deactivating sales receipts:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to deactivate sales receipts'
    };
  }
}
