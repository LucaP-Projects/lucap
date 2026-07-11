'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import {
  TransactionType,
  PaymentMethod,
  TransactionStatus
} from '@/lib/generated/prisma/enums';

import { prisma } from '@/lib/prisma';

type ActionResult = {
  success?: boolean;
  error?: string;
};
interface CreatePaymentData {
  invoiceId: string;
  customerId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  reference?: string;
  metadata?: Record<string, any>;
  // Additional fields for transaction creation
  userId: string; // The user creating the payment
  invoiceNumber: string; // For transaction description
}

// Helper function to create a transaction record
export async function createTransactionRecord({
  type,
  amount,
  description,
  paymentMethod,
  referenceNumber,
  categoryId,
  createdBy,
  metadata = {},
  // New fields for linking
  invoicePaymentId,
  salesReceiptId,
  creditMemoId,
  refundReceiptId
}: {
  type: TransactionType;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  categoryId?: string;
  createdBy: string;
  metadata?: any;
  invoicePaymentId?: string;
  salesReceiptId?: string;
  creditMemoId?: string;
  refundReceiptId?: string;
}) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }
  if (!session?.user?.activeCompanyId) {
    redirect('/select-company');
  }

  return await prisma.transaction.create({
    data: {
      type,
      amount,
      description,
      paymentMethod,
      referenceNumber,
      categoryId,
      createdBy,
      status: TransactionStatus.APPROVED,
      completed: true,
      completedAt: new Date(),
      metadata,
      // Include the linking IDs if provided
      ...(invoicePaymentId && { invoicePaymentId }),
      ...(salesReceiptId && { salesReceiptId }),
      ...(creditMemoId && { creditMemoId }),
      ...(refundReceiptId && { refundReceiptId }),
      companyId: session.user.activeCompanyId
    }
  });
}

// Modified createPayment action
export async function createPayment(data: CreatePaymentData) {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
      return;
    }
    const payment = await prisma.$transaction(async (tx) => {
      // Create the payment record
      const payment = await tx.payment.create({
        data: {
          invoiceId: data.invoiceId,
          customerId: data.customerId,
          amount: data.amount,
          paymentDate: data.paymentDate,
          paymentMethod: data.paymentMethod,
          reference: data.reference,
          companyId: session.user.activeCompanyId!,
          isActive: true
        }
      });

      // Create corresponding transaction record
      await createTransactionRecord({
        type: TransactionType.REVENUE,
        amount: data.amount,
        description: `Payment received for invoice #${data.invoiceNumber}`,
        paymentMethod: data.paymentMethod,
        referenceNumber: data.reference,
        createdBy: data.userId,
        invoicePaymentId: payment.id,
        metadata: {
          paymentType: 'INVOICE_PAYMENT',
          invoiceNumber: data.invoiceNumber
        }
      });

      return payment;
    });

    return { success: true, data: payment };
  } catch (error) {
<<<<<<< HEAD
=======
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
>>>>>>> feat/concierge-service-platform
    console.error('Error creating payment:', error);
    return { success: false, error: 'Failed to create payment' };
  }
}

export async function activatePaymentEvent(id: string): Promise<ActionResult> {
  try {
    if (!id) {
      return { error: 'Payment event ID is required' };
    }

    const paymentEvent = await prisma.paymentEvent.findUnique({
      where: {
        id,
        isActive: true
      },
      include: {
        currentVersion: {
          select: {
            status: true,
            paymentSettings: true
          }
        }
      }
    });

    if (!paymentEvent) {
      return { error: 'Payment event not found' };
    }

    if (!paymentEvent.currentVersion) {
      return { error: 'Payment event has no active version' };
    }

    if (paymentEvent.currentVersion.status !== 'ACTIVE') {
      return { error: 'Cannot activate event: current version is not active' };
    }

    if (!paymentEvent.currentVersion.paymentSettings) {
      return { error: 'Payment settings not configured' };
    }

    await prisma.paymentEvent.update({
      where: { id },
      data: { active: true }
    });

    revalidatePath('/finance/payment-events');
    return { success: true };
  } catch (error) {
<<<<<<< HEAD
=======
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
>>>>>>> feat/concierge-service-platform
    console.error('Error activating payment event:', error);
    return { error: 'Failed to activate payment event' };
  }
}

export async function deactivatePaymentEvent(
  id: string
): Promise<ActionResult> {
  try {
    if (!id) {
      return { error: 'Payment event ID is required' };
    }

    const paymentEvent = await prisma.paymentEvent.findUnique({
      where: {
        id,
        isActive: true
      },
      include: {
        customerPaymentEvents: {
          where: {
            isActive: true,
            OR: [{ status: 'PENDING' }, { status: 'PARTIAL' }]
          }
        }
      }
    });

    if (!paymentEvent) {
      return { error: 'Payment event not found' };
    }

    await prisma.paymentEvent.update({
      where: { id },
      data: { active: false }
    });

    revalidatePath('/finance/payment-events');
    return { success: true };
  } catch (error) {
<<<<<<< HEAD
=======
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
>>>>>>> feat/concierge-service-platform
    console.error('Error deactivating payment event:', error);
    return { error: 'Failed to deactivate payment event' };
  }
}
export async function deletePaymentEvent(id: string): Promise<ActionResult> {
  if (!id) {
    return { error: 'Payment event ID is required' };
  }

  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return { error: 'Authentication required' };
    }

    // First check if the event exists and can be deleted
    const paymentEvent = await prisma.paymentEvent.findUnique({
      where: {
        id,
        isActive: true
      },
      include: {
        customerPaymentEvents: {
          where: { isActive: true }
        },
        versions: {
          where: { isActive: true }
        }
      }
    });

    if (!paymentEvent) {
      return { error: 'Payment event not found' };
    }

    // Check for customer payment events
    if (paymentEvent.customerPaymentEvents.length > 0) {
      return {
        error: 'Cannot delete payment event with existing customer assignments'
      };
    }

    // Perform soft deletion in correct order within a transaction
    await prisma.$transaction(async (tx) => {
      // 1. First null out the versionId reference to break the circular dependency
      await tx.paymentEvent.update({
        where: { id },
        data: { versionId: null }
      });

      // 2. Soft delete any customerPaymentEvents (should be none, but for safety)
      await tx.customerPaymentEvent.updateMany({
        where: {
          paymentEventId: id,
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent payment event deactivated'
        }
      });

      // 3. Soft delete all versions' items
      for (const version of paymentEvent.versions) {
        await tx.paymentEventItem.updateMany({
          where: {
            versionId: version.id,
            isActive: true
          },
          data: {
            isActive: false,
            deactivatedAt: new Date(),
            deactivatedByUserId: session.user.id,
            deactivationReason: 'Parent payment event version deactivated'
          }
        });
      }

      // 4. Soft delete all versions
      await tx.paymentEventVersion.updateMany({
        where: {
          paymentEventId: id,
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent payment event deactivated'
        }
      });

      // 5. Finally soft delete the payment event itself
      await tx.paymentEvent.update({
        where: { id },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Payment event deactivated by user'
        }
      });
    });

    revalidatePath('/finance/payment-events');
    return { success: true };
  } catch (error) {
<<<<<<< HEAD
=======
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
>>>>>>> feat/concierge-service-platform
    console.error('Error deactivating payment event:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to deactivate payment event'
    };
  }
}
