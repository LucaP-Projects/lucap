'use server';
import { startOfDay, endOfDay } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PaymentStatus, Prisma } from '@/lib/generated/prisma/client';

export type InvoiceFilters = {
  status?: PaymentStatus | undefined;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  search?: string | undefined;
  convertedFromEstimate?: boolean;
};

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export type InvoiceBasic = Prisma.InvoiceGetPayload<{
  include: {
    customer: {
      select: {
        displayName: true;
        primaryEmail: true;
      };
    };
    items: true;
    payments: {
      select: {
        amount: true;
        paymentDate: true;
        paymentMethod: true;
      };
    };
    estimate: {
      select: {
        id: true;
        number: true;
      };
    };
  };
}>;

export type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: {
    customer: {
      select: {
        displayName: true;
        primaryEmail: true;
      };
    };
    items: true;
    payments: {
      select: {
        id: true;
        amount: true;
        paymentDate: true;
        paymentMethod: true;
        reference: true;
        metadata: true;
      };
    };
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
    estimate: {
      select: {
        id: true;
        number: true;
        status: true;
      };
    };

    customerPaymentEvent: {
      select: {
        id: true;
        status: true;
        startDate: true;
        endDate: true;
        paymentEvent: {
          select: {
            id: true;
            type: true;
          };
        };
      };
    };
  };
}>;

export async function getInvoicesPage(
  page: number = 1,
  pageSize: number = 10,
  filters: InvoiceFilters = {}
) {
  const session = await auth.api.getSession({headers: await headers()});
  if (!session?.user?.id) {
    redirect('/login');
  }
  if (!session?.user?.companyId) {
    redirect('/select-company');
  }
  const validPage = Math.max(1, page);
  const validPageSize = Math.min(Math.max(1, pageSize), 100);
  const skip = (validPage - 1) * validPageSize;

  const where: Prisma.InvoiceWhereInput = {
    companyId: session.user.companyId,
    isActive: true
  };

  if (filters.status && Object.values(PaymentStatus).includes(filters.status)) {
    where.status = filters.status;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.dueDate = {};
    if (filters.dateFrom) where.dueDate.gte = startOfDay(filters.dateFrom);
    if (filters.dateTo) where.dueDate.lte = endOfDay(filters.dateTo);
  }

  if (filters.convertedFromEstimate !== undefined) {
    where.convertedFromEstimate = filters.convertedFromEstimate;
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
      {
        estimate: {
          number: { contains: filters.search.trim(), mode: 'insensitive' }
        }
      },
      {
        payments: {
          some: {
            reference: { contains: filters.search.trim(), mode: 'insensitive' }
          }
        }
      }
    ];
  }

  const [total, invoices] = await Promise.all([
    db.invoice.count({ where }),
    db.invoice.findMany({
      where,
      include: {
        customer: {
          select: {
            displayName: true,
            primaryEmail: true
          }
        },
        items: true,
        payments: {
          select: {
            amount: true,
            paymentDate: true,
            paymentMethod: true
          }
        },
        estimate: {
          select: {
            id: true,
            number: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: validPageSize
    })
  ]);

  return {
    data: invoices,
    metadata: {
      total,
      page: validPage,
      pageSize: validPageSize,
      pageCount: Math.ceil(total / validPageSize)
    }
  };
}

export async function getInvoiceStats() {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    // Get all invoices with their payments to calculate accurate amounts
    const invoices = await prisma.invoice.findMany({
      where: {
        companyId: session.user.companyId,
        isActive: true
      },
      include: {
        payments: {
          where: { isActive: true }
        }
      }
    });

    // Initialize counters
    const totalCount = invoices.length;
    let totalAmount = 0;
    let totalPaid = 0;
    let estimateConversionCount = 0;

    // Initialize status breakdown with correct structure
    const statusBreakdown: Record<
      PaymentStatus,
      { count: number; amount: number }
    > = {
      PENDING: { count: 0, amount: 0 },
      PAID: { count: 0, amount: 0 },
      OVERDUE: { count: 0, amount: 0 },
      PARTIAL: { count: 0, amount: 0 },
      CANCELLED: { count: 0, amount: 0 }
    };

    // Calculate actual statistics from invoices
    for (const invoice of invoices) {
      totalAmount += invoice.amount;

      // Calculate total paid for this invoice
      const paidAmount = invoice.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      totalPaid += paidAmount;

      // Count estimate conversions
      if (invoice.convertedFromEstimate) {
        estimateConversionCount++;
      }

      // Update status breakdown with CORRECT REMAINING AMOUNTS
      if (invoice.status in statusBreakdown) {
        statusBreakdown[invoice.status as PaymentStatus].count++;

        // For PARTIAL status, use the REMAINING balance, not the full amount
        if (invoice.status === 'PARTIAL') {
          statusBreakdown[invoice.status].amount += invoice.amount - paidAmount;
        } else {
          statusBreakdown[invoice.status].amount += invoice.amount;
        }
      }
    }

    // Calculate conversion rate
    const conversionRate =
      totalCount > 0
        ? Number((estimateConversionCount / totalCount) * 100).toFixed(1)
        : '0.0';

    return {
      totalInvoices: totalCount,
      totalAmount: totalAmount,
      totalPaid: totalPaid,
      statusBreakdown: statusBreakdown,
      estimateConversions: {
        count: estimateConversionCount,
        rate: Number(conversionRate)
      },
      outstandingAmount: totalAmount - totalPaid
    };
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    throw new Error('Failed to fetch invoice statistics');
  }
}

export async function getInvoiceDetails(
  id: string
): Promise<InvoiceWithRelations | null> {
  const session = await auth.api.getSession({headers: await headers()});
  if (!session?.user?.id) {
    redirect('/login');
  }
  if (!session?.user?.companyId) {
    redirect('/select-company');
  }
  return db.invoice.findUnique({
    where: {
      id,
      companyId: session.user.companyId,
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
      payments: {
        where: { isActive: true },
        select: {
          id: true,
          amount: true,
          paymentDate: true,
          paymentMethod: true,
          reference: true,
          metadata: true
        }
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
      estimate: {
        select: {
          id: true,
          number: true,
          status: true
        }
      },

      customerPaymentEvent: {
        select: {
          id: true,
          status: true,
          startDate: true,
          endDate: true,
          paymentEvent: {
            select: {
              id: true,
              type: true
            }
          }
        }
      }
    }
  });
}

export async function deleteInvoices(ids: string[]): Promise<DeleteResult> {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return {
      success: false,
      error: 'No invoices selected for deletion'
    };
  }

  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    // Check for invoices that can't be deleted
    const nonDeletableInvoices = await prisma.invoice.findMany({
      where: {
        companyId: session.user.companyId,
        id: { in: ids },
        isActive: true,
        OR: [
          { status: { in: ['PAID', 'PARTIAL'] as PaymentStatus[] } },
          { payments: { some: { isActive: true } } }
        ]
      },
      select: {
        number: true,
        status: true,
        payments: {
          select: {
            id: true
          }
        }
      }
    });

    if (nonDeletableInvoices.length > 0) {
      return {
        success: false,
        error: `Cannot delete paid or partially paid invoices. Affected invoice numbers: ${nonDeletableInvoices
          .map((i) => i.number)
          .join(', ')}`
      };
    }

    // Use a transaction to ensure all operations succeed or none do
    await prisma.$transaction(async (tx) => {
      // 1. Soft delete invoice attachments
      await tx.invoiceAttachment.updateMany({
        where: {
          invoiceId: {
            in: ids
          },
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent invoice deactivated'
        }
      });

      // 2. Soft delete invoice items
      await tx.invoiceItem.updateMany({
        where: {
          invoiceId: {
            in: ids
          },
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent invoice deactivated'
        }
      });

      // 3. Update any related estimates
      await tx.estimate.updateMany({
        where: {
          invoiceId: {
            in: ids
          },
          isActive: true
        },
        data: {
          convertedToInvoice: false,
          invoiceId: null
        }
      });

      // 4. Soft delete the invoices themselves
      await tx.invoice.updateMany({
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
          deactivationReason: 'Invoice deactivated by user'
        }
      });
    });

    revalidatePath('/invoices');

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deactivating invoices:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to deactivate invoices'
    };
  }
}
