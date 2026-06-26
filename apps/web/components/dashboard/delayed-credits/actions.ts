'use server';
import { startOfDay, endOfDay } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { getSessionWithCompany } from '@/lib/auth';
import { CreditStatus } from '@/lib/generated/prisma/enums';
import * as Prisma from '@/lib/generated/prisma/internal/prismaNamespace';

import { prisma } from '@/lib/prisma';

export type DelayedCreditFilters = {
  status?: CreditStatus | undefined;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  search?: string | undefined;
};

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export type DelayedCreditBasic = {
  id: string;
  number: string;
  customer: {
    displayName: string;
    primaryEmail: string | null;
  };
  amount: number;

  status: CreditStatus;
  createdAt: Date;

  taxAmount?: number;
  customerId?: string;
  originalInvoiceId?: string | null;
  creditRef?: string | null;
  notes?: string | null;
  emailCustomer?: string | null;
  updatedAt?: Date;
};

export type DelayedCreditWithRelations = Prisma.DelayedCreditGetPayload<{
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

export async function getDelayedCreditsPage(
  page: number = 1,
  pageSize: number = 10,
  filters: DelayedCreditFilters = {}
) {
  const skip = (page - 1) * pageSize;

  // Build where clause based on filters
  const where: Prisma.DelayedCreditWhereInput = {
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
  const total = await prisma.delayedCredit.count({ where });

  // Get credits for current page
  const data = await prisma.delayedCredit.findMany({
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

      // creditMethod: true,
      // reason: true,
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

export async function getDelayedCreditStats() {
  // Get credits grouped by status
  const statusGroups = await prisma.delayedCredit.groupBy({
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
  const totals = await prisma.delayedCredit.aggregate({
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
    CreditStatus,
    { count: number; amount: number }
  > = {
    PENDING: { count: 0, amount: 0 },
    CREDITED: { count: 0, amount: 0 },
    CANCELED: { count: 0, amount: 0 }
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
    totalCredits: totals._count._all,
    totals: {
      subtotal: total - tax,
      tax: tax,
      total: total
    },
    statusBreakdown
  };
}

export async function getDelayedCreditDetails(
  id: string
): Promise<DelayedCreditWithRelations | null> {
  return prisma.delayedCredit.findUnique({
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

export async function deleteDelayedCredits(
  ids: string[]
): Promise<DeleteResult> {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return {
      success: false,
      error: 'No delayed credits selected for deletion'
    };
  }

  try {
    // Get the current session for user ID
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Check if any credits are already processed
    const processedCredits = await prisma.delayedCredit.findMany({
      where: {
        id: {
          in: ids
        },
        status: 'CREDITED',
        isActive: true
      },
      select: {
        number: true
      }
    });

    if (processedCredits.length > 0) {
      return {
        success: false,
        error: `Cannot delete delayed credits that have been processed: ${processedCredits
          .map((c) => c.number)
          .join(', ')}`
      };
    }

    // Use a transaction to ensure all operations succeed or none do
    await prisma.$transaction(async (tx) => {
      // 1. Soft delete credit attachments
      await tx.delayedCreditAttachment.updateMany({
        where: {
          creditId: {
            in: ids
          },
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent delayed credit deactivated'
        }
      });

      // 2. Soft delete credit items
      await tx.delayedCreditItem.updateMany({
        where: {
          creditId: {
            in: ids
          },
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent delayed credit deactivated'
        }
      });

      // 3. Soft delete the credits themselves
      await tx.delayedCredit.updateMany({
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
          deactivationReason: 'Delayed credit deactivated by user'
        }
      });
    });

    // Revalidate the delayed credits page
    revalidatePath('/delayedcredits');

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deactivating delayed credits:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to deactivate delayed credits'
    };
  }
}
