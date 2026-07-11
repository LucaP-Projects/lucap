'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { PaymentStatus } from '@/lib/generated/prisma/enums';
import { prisma } from '@/lib/prisma';
import { PaymentFormValues } from './schema';
import { distributePayment } from './utils';

export interface GetCustomerInvoicesResult {
  number: string;
  amount: number;
  id: string;
  dueDate: Date;
  status: PaymentStatus;
  payments: { amount: number; id: string; }[]; 
}

export async function getCustomerInvoices(customerId: string): Promise<GetCustomerInvoicesResult[]> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }
    return await prisma.invoice.findMany({
      where: {
        customerId,
        companyId: session.user.activeCompanyId,
        status: {
          in: ['PENDING', 'PARTIAL']
        },
        isActive: true
      },
      select: {
        id: true,
        number: true,
        amount: true,
        dueDate: true,
        status: true,
        payments: {
          where: { isActive: true },
          select: {
            id: true,
            amount: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
}

export async function createPayment(data: PaymentFormValues) {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    const result = await prisma.$transaction(
      async (tx) => {
        // Fetch invoices with their snapshots
        const invoices = await tx.invoice.findMany({
          where: {
            companyId: session.user.activeCompanyId,
            id: { in: data.invoiceIds },
            OR: [{ status: 'PENDING' }, { status: 'PARTIAL' }],
            isActive: true
          },
          include: {
            payments: {
              where: { isActive: true },
              select: { amount: true }
            }
          }
        });

        if (invoices.length !== data.invoiceIds.length) {
          throw new Error('One or more invoices are invalid or already paid');
        }

        // Calculate payment distribution
        const payments = distributePayment(data.amount, invoices);
        if (payments.reduce((sum, p) => sum + p.amount, 0) !== data.amount) {
          throw new Error('Payment distribution mismatch');
        }

        // Process each payment with snapshot tracking
        const createdPayments = await Promise.all(
          payments.map(async (payment) => {
            const invoice = invoices.find(
              (inv) => inv.id === payment.invoiceId
            );
            if (!invoice) return null;

            const snapshot =
              invoice.paymentEventSnapshot as PrismaJson.PaymentEventSnapshot;
            const currentTracking = snapshot.paymentTracking ?? {
              totalPaid: 0,
              remainingBalance: invoice.amount,
              numberOfPayments: 0,
              paymentHistory: []
            };

            // Create payment record with isActive flag
            const paymentRecord = await tx.payment.create({
              data: {
                companyId: session.user.activeCompanyId,
                invoiceId: payment.invoiceId,
                customerId: data.customerId,
                amount: payment.amount,
                paymentDate: data.paymentDate,
                paymentMethod: data.paymentMethod,
                reference: data.reference,
                metadata: data.notes ? { notes: data.notes } : {},
                isActive: true
              }
            });

            // Update payment tracking
            const totalPaid = currentTracking.totalPaid + payment.amount;
            const remainingBalance = invoice.amount - totalPaid;
            const newPaymentRecord = {
              id: paymentRecord.id,
              amount: payment.amount,
              date: data.paymentDate.toISOString(),
              paymentMethod: data.paymentMethod,
              reference: data.reference || undefined,
              balance: remainingBalance
            };

            const updatedTracking = {
              totalPaid,
              remainingBalance,
              lastPaymentDate: data.paymentDate.toISOString(),
              numberOfPayments: currentTracking.numberOfPayments + 1,
              paymentHistory: [
                ...currentTracking.paymentHistory,
                newPaymentRecord
              ]
            };

            // Update invoice status and snapshot
            await tx.invoice.update({
              where: { id: payment.invoiceId },
              data: {
                status: Math.abs(remainingBalance) < 0.01 ? 'PAID' : 'PARTIAL',
                paymentEventSnapshot: {
                  ...snapshot,
                  paymentTracking: updatedTracking
                }
              }
            });

            return paymentRecord;
          })
        );

        return createdPayments.filter(Boolean);
      },
      {
        maxWait: 10000,
        timeout: 30000
      }
    );

    revalidatePath('/receive-payment');
    revalidatePath('/payments');
    return { success: true, data: result };
  } catch (error) {
    console.error('Error creating payment:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to process payment'
    };
  }
}
