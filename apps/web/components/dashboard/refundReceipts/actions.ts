'use server';
import {
  RefundStatus,
  Prisma,
  PaymentMethod,
  RefundReason
} from '@/lib/generated/prisma/client';
import { startOfDay, endOfDay } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export type RefundReceiptFilters = {
  status?: RefundStatus | undefined;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  search?: string | undefined;
};

export interface DeleteResult {
  success: boolean;
  error?: string;
}
export type RefundReceiptBasic = {
  id: string;
  number: string;
  customer: {
    displayName: string;
    primaryEmail: string | null;
  };
  amount: number;
  refundMethod: PaymentMethod;
  originalPaymentMethod: PaymentMethod | null;
  reason: RefundReason;
  status: RefundStatus;
  createdAt: Date;

  taxAmount?: number;
  customerId?: string;
  originalReceiptId?: string | null;
  originalInvoiceId?: string | null;
  refundRef?: string | null;
  notes?: string | null;
  emailCustomer?: string | null;
  updatedAt?: Date;
};

export type RefundReceiptWithRelations = Prisma.RefundReceiptGetPayload<{
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
  };
}>;

export async function getRefundReceiptsPage(
  page: number = 1,
  pageSize: number = 10,
  filters: RefundReceiptFilters = {}
) {
  const skip = (page - 1) * pageSize;

  // Build where clause based on filters
  const where: Prisma.RefundReceiptWhereInput = {
    isActive: true
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) {
      where.createdAt.gte = startOfDay(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.createdAt.lte = endOfDay(filters.dateTo);
    }
  }

  if (filters.search) {
    where.OR = [
      { number: { contains: filters.search, mode: 'insensitive' } },
      {
        customer: {
          displayName: { contains: filters.search, mode: 'insensitive' }
        }
      }
    ];
  }

  // Get total count for pagination
  const total = await db.refundReceipt.count({ where });

  // Get refunds for current page
  const data = await db.refundReceipt.findMany({
    where,
    take: pageSize,
    skip,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      number: true,
      status: true,
      customer: {
        select: {
          displayName: true,
          primaryEmail: true
        }
      },
      amount: true,
      refundMethod: true,
      originalPaymentMethod: true,
      reason: true,
      createdAt: true
    }
  });

  return {
    data,
    metadata: {
      total,
      pageCount: Math.ceil(total / pageSize),
      currentPage: page
    }
  };
}

export async function getRefundReceiptStats() {
  // Get refunds grouped by status
  const statusGroups = await db.refundReceipt.groupBy({
    by: ['status'],
    _count: {
      _all: true
    },
    _sum: {
      amount: true
    },
    where: { isActive: true }
  });

  // Calculate totals
  const totals = await db.refundReceipt.aggregate({
    _sum: {
      taxAmount: true,
      amount: true
    },
    _count: {
      _all: true
    },
    where: { isActive: true }
  });

  // Initialize status breakdown with all possible statuses
  const statusBreakdown: Record<
    RefundStatus,
    { count: number; amount: number }
  > = {
    PENDING: { count: 0, amount: 0 },
    PROCESSED: { count: 0, amount: 0 },
    REJECTED: { count: 0, amount: 0 },
    CANCELLED: { count: 0, amount: 0 }
  };

  // Fill in actual values
  statusGroups.forEach((group) => {
    statusBreakdown[group.status] = {
      count: group._count._all,
      amount: group._sum.amount || 0
    };
  });

  const total = totals._sum.amount || 0;
  const tax = totals._sum.taxAmount || 0;

  return {
    totalRefunds: totals._count._all,
    totals: {
      subtotal: total - tax,
      tax: tax,
      total: total
    },
    statusBreakdown
  };
}

export async function getRefundReceiptDetails(
  id: string
): Promise<RefundReceiptWithRelations | null> {
  return db.refundReceipt.findUnique({
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
      }
    }
  });
}

export async function deleteRefundReceipts(
  ids: string[]
): Promise<DeleteResult> {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return {
      success: false,
      error: 'No refund receipts selected for deletion'
    };
  }

  try {
    // Get the current session for user ID
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Check if any refunds are already processed
    const processedRefunds = await db.refundReceipt.findMany({
      where: {
        id: {
          in: ids
        },
        status: 'PROCESSED',
        isActive: true
      },
      select: {
        number: true
      }
    });

    if (processedRefunds.length > 0) {
      return {
        success: false,
        error: `Cannot delete refund receipts that have been processed: ${processedRefunds
          .map((r) => r.number)
          .join(', ')}`
      };
    }

    // Use a transaction to ensure all operations succeed or none do
    await db.$transaction(async (tx) => {
      // 1. Soft delete refund attachments
      await tx.refundAttachment.updateMany({
        where: {
          refundReceiptId: {
            in: ids
          },
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent refund receipt deactivated'
        }
      });

      // 2. Soft delete refund items
      await tx.refundReceiptItem.updateMany({
        where: {
          refundReceiptId: {
            in: ids
          },
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent refund receipt deactivated'
        }
      });

      // 3. Soft delete the refunds themselves
      await tx.refundReceipt.updateMany({
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
          deactivationReason: 'Refund receipt deactivated by user'
        }
      });
    });

    // Revalidate the refund receipts page
    revalidatePath('/refund-receipts');

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deactivating refund receipts:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to deactivate refund receipts'
    };
  }
}
