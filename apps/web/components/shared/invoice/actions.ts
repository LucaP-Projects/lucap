'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { PaymentStatus } from '@/lib/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export type InvoiceSelectData = {
  id: string;
  number: string;
  amount: number;
  status: PaymentStatus;
  dueDate: Date;
  customer: {
    displayName: string;
  };
};

type InvoiceResponse = {
  success: boolean;
  data?: InvoiceSelectData[];
  error?: string;
  redirect?: string;
};

type SingleInvoiceResponse = {
  success: boolean;
  data?: InvoiceSelectData;
  error?: string;
  redirect?: string;
};

export async function getInvoiceById(
  id: string
): Promise<SingleInvoiceResponse> {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    const invoice = await prisma.invoice.findUnique({
      where: {
        id,
        companyId: session.user.companyId,
        isActive: true
      },
      select: {
        id: true,
        number: true,
        amount: true,
        status: true,
        dueDate: true,
        customer: {
          select: {
            displayName: true
          }
        }
      }
    });

    return { success: true, data: invoice || undefined };
  } catch (error) {
    console.error('Error fetching invoice by id:', error);
    return { success: false, error: 'Failed to fetch invoice' };
  }
}

export async function getInvoicesForSelect(
  search?: string
): Promise<InvoiceResponse> {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        companyId: session.user.companyId,
        isActive: true,
        OR: search
          ? [
              {
                number: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                customer: {
                  displayName: {
                    contains: search,
                    mode: 'insensitive'
                  }
                }
              }
            ]
          : undefined
      },
      select: {
        id: true,
        number: true,
        amount: true,
        status: true,
        dueDate: true,
        customer: {
          select: {
            displayName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    return { success: true, data: invoices };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return { success: false, error: 'Failed to fetch invoices' };
  }
}

/**
 * Get the count of pending invoices for a specific company
 * @param companyId The ID of the company
 * @returns The count of pending invoices (not PAID or CANCELLED)
 */
export async function getPendingInvoicesCount(
  companyId: string
): Promise<number> {
  if (!companyId) {
    throw new Error('Company ID is required');
  }

  try {
    const count = await prisma.invoice.count({
      where: {
        companyId: companyId,
        isActive: true,
        status: {
          notIn: ['PAID', 'CANCELLED']
        }
      }
    });

    return count;
  } catch (error) {
    console.error('Failed to fetch pending invoices count:', error);
    throw new Error('Failed to fetch pending invoices count');
  }
}
