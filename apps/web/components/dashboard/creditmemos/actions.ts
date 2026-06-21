'use server';
import { CreditMemoStatus, Prisma } from '@/lib/generated/prisma/client';
import { startOfDay, endOfDay } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
export type CreditMemoFilters = {
  status?: CreditMemoStatus | undefined;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  search?: string | undefined;
};

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export type CreditMemoBasic = Prisma.CreditMemoGetPayload<{
  include: {
    customer: {
      select: {
        displayName: true;
        primaryEmail: true;
      };
    };
  };
}>;

export type CreditMemoWithRelations = Prisma.CreditMemoGetPayload<{
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

export async function getCreditMemosPage(
  page: number = 1,
  pageSize: number = 10,
  filters: CreditMemoFilters = {}
) {
  const validPage = Math.max(1, page);
  const validPageSize = Math.min(Math.max(1, pageSize), 100);
  const skip = (validPage - 1) * validPageSize;

  const where: Prisma.CreditMemoWhereInput = {
    isActive: true
  };

  if (
    filters.status &&
    Object.values(CreditMemoStatus).includes(filters.status)
  ) {
    where.status = filters.status;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.issueDate = {};
    if (filters.dateFrom) where.issueDate.gte = startOfDay(filters.dateFrom);
    if (filters.dateTo) where.issueDate.lte = endOfDay(filters.dateTo);
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

  const [total, creditMemos] = await Promise.all([
    db.creditMemo.count({ where }),
    db.creditMemo.findMany({
      where,
      include: {
        customer: {
          select: {
            displayName: true,
            primaryEmail: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: validPageSize
    })
  ]);

  return {
    data: creditMemos,
    metadata: {
      total,
      page: validPage,
      pageSize: validPageSize,
      pageCount: Math.ceil(total / validPageSize)
    }
  };
}

export async function getCreditMemoStats() {
  try {
    const [totalCount, totalAmount, statusBreakdown] = await Promise.all([
      db.creditMemo.count({ where: { isActive: true } }),
      db.creditMemo.aggregate({
        where: { isActive: true },
        _sum: {
          amount: true
        }
      }),
      db.creditMemo.groupBy({
        where: { isActive: true },
        by: ['status'],
        _count: true
      })
    ]);

    const initialStatusBreakdown: Record<CreditMemoStatus, number> = {
      DRAFT: 0,
      ISSUED: 0,
      APPLIED: 0,
      VOID: 0
    };

    // Update with actual counts
    statusBreakdown.forEach(({ status, _count }) => {
      if (status in initialStatusBreakdown) {
        initialStatusBreakdown[status as CreditMemoStatus] = _count;
      }
    });

    return {
      totalCreditMemos: totalCount,
      totalAmount: Number(totalAmount._sum.amount || 0),
      statusBreakdown: initialStatusBreakdown
    };
  } catch (error) {
    console.error('Error fetching credit memo stats:', error);
    throw new Error('Failed to fetch credit memo statistics');
  }
}

export async function getCreditMemoDetails(
  id: string
): Promise<CreditMemoWithRelations | null> {
  return db.creditMemo.findUnique({
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

export async function deleteCreditMemos(ids: string[]): Promise<DeleteResult> {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return {
      success: false,
      error: 'No credit memos selected for deletion'
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

    // Check if any credit memos are already applied
    const appliedMemos = await db.creditMemo.findMany({
      where: {
        id: {
          in: ids
        },
        status: 'APPLIED',
        isActive: true
      },
      select: {
        number: true
      }
    });

    if (appliedMemos.length > 0) {
      return {
        success: false,
        error: `Cannot delete credit memos that have been applied: ${appliedMemos
          .map((cm) => cm.number)
          .join(', ')}`
      };
    }

    // Use a transaction to ensure all operations succeed or none do
    await db.$transaction(async (tx) => {
      // 1. Soft delete credit memo attachments
      await tx.creditMemoAttachment.updateMany({
        where: {
          creditMemoId: {
            in: ids
          },
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent credit memo deactivated'
        }
      });

      // 2. Soft delete credit memo items
      await tx.creditMemoItem.updateMany({
        where: {
          creditMemoId: {
            in: ids
          },
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent credit memo deactivated'
        }
      });

      // 3. Soft delete the credit memos themselves
      await tx.creditMemo.updateMany({
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
          deactivationReason: 'Credit memo deactivated by user'
        }
      });
    });

    // Revalidate the credit memos page
    revalidatePath('/credit-memos');

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deactivating credit memos:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to deactivate credit memos'
    };
  }
}
