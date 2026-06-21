'use server';
import { startOfDay, endOfDay } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ChargeStatus, Prisma } from '@/lib/generated/prisma/client';

export type DelayedChargeFilters = {
  status?: ChargeStatus | undefined;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  search?: string | undefined;
};

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export type DelayedChargeBasic = Prisma.DelayedChargeGetPayload<{
  include: {
    customer: {
      select: {
        displayName: true;
        primaryEmail: true;
      };
    };
    items: true;
  };
}>;

export type DelayedChargeWithRelations = Prisma.DelayedChargeGetPayload<{
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
    tax: true;
  };
}>;

export async function getDelayedChargesPage(
  page: number = 1,
  pageSize: number = 10,
  filters: DelayedChargeFilters = {}
) {
  const validPage = Math.max(1, page);
  const validPageSize = Math.min(Math.max(1, pageSize), 100);
  const skip = (validPage - 1) * validPageSize;

  const where: Prisma.DelayedChargeWhereInput = {
    isActive: true
  };

  if (filters.status && Object.values(ChargeStatus).includes(filters.status)) {
    where.status = filters.status;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.dueDate = {};
    if (filters.dateFrom) where.dueDate.gte = startOfDay(filters.dateFrom);
    if (filters.dateTo) where.dueDate.lte = endOfDay(filters.dateTo);
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
      }
    ];
  }

  const [total, charges] = await Promise.all([
    db.delayedCharge.count({ where }),
    db.delayedCharge.findMany({
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
    data: charges,
    metadata: {
      total,
      page: validPage,
      pageSize: validPageSize,
      pageCount: Math.ceil(total / validPageSize)
    }
  };
}

export async function getDelayedChargeStats() {
  try {
    const [totalCount, totals, statusBreakdown] = await Promise.all([
      db.delayedCharge.count({ where: { isActive: true } }),
      db.delayedCharge.aggregate({
        where: { isActive: true },
        _sum: {
          amount: true,
          taxAmount: true,
          discountAmount: true
        }
      }),
      db.delayedCharge.groupBy({
        where: { isActive: true },
        by: ['status'],
        _count: true,
        _sum: {
          amount: true
        }
      })
    ]);

    const initialStatusBreakdown: Record<
      ChargeStatus,
      { count: number; amount: number }
    > = {
      PENDING: { count: 0, amount: 0 },
      INVOICED: { count: 0, amount: 0 },
      CANCELED: { count: 0, amount: 0 }
    };

    // Update with actual counts and amounts
    statusBreakdown.forEach(({ status, _count, _sum }) => {
      if (status in initialStatusBreakdown) {
        initialStatusBreakdown[status as ChargeStatus] = {
          count: _count,
          amount: Number(_sum.amount || 0)
        };
      }
    });

    // Calculate subtotal (amount - taxAmount + discountAmount)
    const subtotal =
      Number(totals._sum.amount || 0) -
      Number(totals._sum.taxAmount || 0) +
      Number(totals._sum.discountAmount || 0);

    return {
      totalCharges: totalCount,
      totals: {
        subtotal: subtotal,
        tax: Number(totals._sum.taxAmount || 0),
        total: Number(totals._sum.amount || 0)
      },
      statusBreakdown: initialStatusBreakdown,
      pendingAmount: initialStatusBreakdown.PENDING.amount
    };
  } catch (error) {
    console.error('Error fetching delayed charge stats:', error);
    throw new Error('Failed to fetch delayed charge statistics');
  }
}

export async function getDelayedChargeDetails(
  id: string
): Promise<DelayedChargeWithRelations | null> {
  return db.delayedCharge.findUnique({
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
      tax: true
    }
  });
}

export async function deleteDelayedCharges(
  ids: string[]
): Promise<DeleteResult> {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return {
      success: false,
      error: 'No delayed charges selected for deletion'
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

    // Check if any charges are already invoiced
    const nonDeletableCharges = await prisma.delayedCharge.findMany({
      where: {
        id: { in: ids },
        status: 'INVOICED',
        isActive: true
      },
      select: {
        number: true
      }
    });

    if (nonDeletableCharges.length > 0) {
      return {
        success: false,
        error: `Cannot delete charges that have been invoiced: ${nonDeletableCharges
          .map((c) => c.number)
          .join(', ')}`
      };
    }

    // Use a transaction to ensure all operations succeed or none do
    await prisma.$transaction(async (tx) => {
      // 1. Soft delete charge attachments
      await tx.chargeAttachment.updateMany({
        where: {
          chargeId: {
            in: ids
          },
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent charge deactivated'
        }
      });

      // 2. Soft delete charge items
      await tx.delayedChargeItem.updateMany({
        where: {
          chargeId: {
            in: ids
          },
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent charge deactivated'
        }
      });

      // 3. Soft delete the charges themselves
      await tx.delayedCharge.updateMany({
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
          deactivationReason: 'Delayed charge deactivated by user'
        }
      });
    });

    // Revalidate the delayed charges page
    revalidatePath('/delayedcharges');

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deactivating delayed charges:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to deactivate delayed charges'
    };
  }
}
