'use server';
import { startOfDay, endOfDay } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { getSessionWithCompany } from '@/lib/auth';
import { EstimateStatus } from '@/lib/generated/prisma/enums';
import * as Prisma from '@/lib/generated/prisma/internal/prismaNamespace';
import { prisma } from '@/lib/prisma';

export type EstimateFilters = {
  status?: EstimateStatus | undefined;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  search?: string | undefined;
};
export interface DeleteResult {
  success: boolean;
  error?: string;
}
export type EstimateBasic = Prisma.EstimateGetPayload<{
  include: {
    customer: {
      select: {
        displayName: true;
        primaryEmail: true;
      };
    };
  };
}>;
export type EstimateWithRelations = Prisma.EstimateGetPayload<{
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
export async function getEstimatesPage(
  page: number = 1,
  pageSize: number = 10,
  filters: EstimateFilters = {}
) {
  const validPage = Math.max(1, page);
  const validPageSize = Math.min(Math.max(1, pageSize), 100);
  const skip = (validPage - 1) * validPageSize;

  const where: Prisma.EstimateWhereInput = {
    isActive: true
  };

  if (
    filters.status &&
    Object.values(EstimateStatus).includes(filters.status)
  ) {
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

  const [total, estimates] = await Promise.all([
    prisma.estimate.count({ where }),
    prisma.estimate.findMany({
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
    data: estimates,
    metadata: {
      total,
      page: validPage,
      pageSize: validPageSize,
      pageCount: Math.ceil(total / validPageSize)
    }
  };
}
export async function getEstimateStats() {
  try {
    const [totalCount, totalAmount, statusBreakdown] = await Promise.all([
      prisma.estimate.count({ where: { isActive: true } }),
      prisma.estimate.aggregate({
        where: { isActive: true },
        _sum: {
          amount: true
        }
      }),
      prisma.estimate.groupBy({
        where: { isActive: true },
        by: ['status'],
        _count: true
      })
    ]);

    // Calculate conversion rate with safety checks
    const conversionRate =
      totalCount === 0
        ? 0
        : await prisma.estimate
            .count({
              where: {
                status: 'CONVERTED'
              }
            })
            .then((converted) =>
              Number((converted / totalCount) * 100).toFixed(1)
            )
            .then(Number);

    const initialStatusBreakdown: Record<EstimateStatus, number> = {
      DRAFT: 0,
      SENT: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      EXPIRED: 0,
      CONVERTED: 0
    };

    // Update with actual counts
    statusBreakdown.forEach(({ status, _count }) => {
      if (status in initialStatusBreakdown) {
        initialStatusBreakdown[status as EstimateStatus] = _count;
      }
    });

    return {
      totalEstimates: totalCount,
      totalAmount: Number(totalAmount._sum.amount || 0),
      conversionRate,
      statusBreakdown: initialStatusBreakdown
    };
  } catch (error) {
    console.error('Error fetching estimate stats:', error);
    throw new Error('Failed to fetch estimate statistics', { cause: error });
  }
}
export async function getEstimateDetails(
  id: string
): Promise<EstimateWithRelations | null> {
  return prisma.estimate.findUnique({
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
export async function deleteEstimates(ids: string[]): Promise<DeleteResult> {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return {
      success: false,
      error: 'No estimates selected for deletion'
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

    // First check if any of the estimates have been converted to invoices
    const convertedEstimates = await prisma.estimate.findMany({
      where: {
        id: {
          in: ids
        },
        convertedToInvoice: true,
        isActive: true
      },
      select: {
        number: true
      }
    });

    if (convertedEstimates.length > 0) {
      return {
        success: false,
        error: `Cannot delete estimates that have been converted to invoices: ${convertedEstimates
          .map((e) => e.number)
          .join(', ')}`
      };
    }

    // Use a transaction to ensure all operations succeed or none do
    await prisma.$transaction(async (tx) => {
      // 1. Soft delete estimate attachments
      await tx.estimateAttachment.updateMany({
        where: {
          estimateId: {
            in: ids
          },
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent estimate deactivated'
        }
      });

      // 2. Soft delete estimate items
      await tx.estimateItem.updateMany({
        where: {
          estimateId: {
            in: ids
          },
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent estimate deactivated'
        }
      });

      // 3. Soft delete the estimates themselves
      await tx.estimate.updateMany({
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
          deactivationReason: 'Estimate deactivated by user'
        }
      });
    });

    // Revalidate the estimates page
    revalidatePath('/estimates');

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deactivating estimates:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to deactivate estimates'
    };
  }
}
