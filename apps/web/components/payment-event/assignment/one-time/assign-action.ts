'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { generateUniqueNumber } from '@/lib/utils';
import { FormattedCustomer } from '@/types/payment-event/table';
import {
  AssignmentError,
  AssignmentResult,
  AssignOneTimePaymentInput,
  PaymentEventWithRelations
} from './types';
import { headers } from 'next/headers';

// Helper to check if payment settings are for one-time payments
function isOneTimeSettings(
  settings: any
): settings is { type: 'ONE_TIME'; settings: any } {
  return settings?.type === 'ONE_TIME' && settings?.settings;
}
export async function assignOneTimePayment(
  input: AssignOneTimePaymentInput
): Promise<AssignmentResult> {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    let invoiceCreated = false;

    // Validate input
    if (!input.paymentEventId || !input.customerId) {
      throw {
        code: 'INVALID_SETTINGS',
        message: 'Payment event ID and customer ID are required'
      } as AssignmentError;
    }

    // Get customer - add isActive filter
    const customer = await prisma.customer.findUnique({
      where: {
        companyId: session.user.companyId,
        id: input.customerId,
        status: 'ACTIVE',
        isActive: true
      }
    });

    if (!customer) {
      throw {
        code: 'CUSTOMER_NOT_FOUND',
        message: 'Customer not found or is inactive'
      } as AssignmentError;
    }

    // Get payment event with current version - add isActive filter
    const paymentEvent = await prisma.paymentEvent.findUnique({
      where: {
        id: input.paymentEventId,
        companyId: session.user.companyId,
        active: true,
        isActive: true
      },
      include: {
        currentVersion: {
          select: {
            id: true,
            name: true,
            type: true,
            version: true,
            paymentSettings: true,
            items: true
          }
        }
      }
    });

    if (!paymentEvent || !paymentEvent.currentVersion) {
      throw {
        code: 'PAYMENT_EVENT_NOT_FOUND',
        message: 'Payment event or version not found'
      } as AssignmentError;
    }

    const { paymentSettings } = paymentEvent.currentVersion;

    if (!isOneTimeSettings(paymentSettings)) {
      throw {
        code: 'INVALID_SETTINGS',
        message: 'Invalid payment settings type'
      } as AssignmentError;
    }

    const originalAmount = paymentSettings.settings.amount;
    const { defaultDueDate, generateInvoiceNow, minPartialAmount } =
      paymentSettings.settings;

    // Process dates
    const now = new Date();
    const dueDate = defaultDueDate ? new Date(defaultDueDate) : now;

    if (isNaN(dueDate.getTime())) {
      throw {
        code: 'INVALID_DUE_DATE',
        message: 'Invalid due date format'
      } as AssignmentError;
    }

    const shouldCreateInvoiceNow = generateInvoiceNow || dueDate <= now;

    // Perform database operations in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create initial progress state
      const initialProgress: PrismaJson.OneTimeProgress = {
        type: 'ONE_TIME',
        totalAmount: input.amount,
        totalPaid: 0,
        remainingBalance: input.amount,
        status: 'PENDING',
        dueDate: dueDate.toISOString(),
        payments: [],
        lastPaymentDate: undefined,
        lastInvoiceDate: undefined,
        invoiceGenerated: shouldCreateInvoiceNow,
        invoiceId: undefined,
        originalAmount,
        currentAmount: input.amount,
        priceModifications:
          input.amount !== originalAmount
            ? [
                {
                  amount: input.amount,
                  previousAmount: originalAmount,
                  effectiveDate: now.toISOString(),
                  reason: input.reason,
                  modifiedBy: session.user.id,
                  invoiceHandling: {
                    action: 'FUTURE_ONLY',
                    affectedInvoiceId: undefined,
                    adjustmentInvoiceId: undefined
                  }
                }
              ]
            : []
      };

      // Create customer payment event
      const customerPaymentEvent = await tx.customerPaymentEvent.create({
        data: {
          paymentEventId: paymentEvent.id,
          customerId: input.customerId,
          versionId: paymentEvent.currentVersion!.id,
          startDate: now,
          status: 'PENDING',
          credit: 0,
          progress: initialProgress,
          isActive: true // Add isActive flag when creating
        }
      });

      let finalProgress = initialProgress;

      // Handle immediate invoice creation if needed
      if (shouldCreateInvoiceNow) {
        try {
          invoiceCreated = true;
          const invoiceNumber = generateUniqueNumber();

          const invoice = await tx.invoice.create({
            data: {
              companyId: session.user.companyId,
              number: invoiceNumber,
              customerId: input.customerId,
              paymentEventId: customerPaymentEvent.id,
              amount: input.amount,
              dueDate,
              items: {
                create: paymentEvent.currentVersion!.items.map((item) => ({
                  productName: item.productName,
                  description: item.description,
                  quantity: item.quantity,
                  rate: item.rate,
                  amount: item.amount,
                  taxable: item.taxable,
                  isActive: true // Add isActive flag
                }))
              },
              status: 'PENDING',
              paymentEventSnapshot: {
                id: paymentEvent.id,
                name: paymentEvent.currentVersion!.name,
                versionId: paymentEvent.currentVersion!.id,
                versionNumber: paymentEvent.currentVersion!.version,
                type: 'ONE_TIME',
                snapshotTimestamp: now.toISOString(),
                amount: input.amount,
                originalAmount,
                priceModified: input.amount !== originalAmount,
                priceModificationReason: input.reason,
                generateInvoiceNow: shouldCreateInvoiceNow,
                dueDate: defaultDueDate,
                minPartialAmount: minPartialAmount || input.amount * 0.1,
                items: paymentEvent.currentVersion!.items.map((item) => ({
                  productName: item.productName,
                  description: item.description,
                  quantity: item.quantity,
                  rate: item.rate,
                  amount: item.amount,
                  taxable: item.taxable
                }))
              } as PrismaJson.PaymentEventSnapshot,
              isLinkedToVersion: true,
              isActive: true // Add isActive flag
            }
          });

          // Update progress with invoice information
          finalProgress = {
            ...initialProgress,
            lastInvoiceDate: now.toISOString(),
            invoiceId: invoice.id,
            invoiceGenerated: true
          };

          // Update customer payment event with final progress
          await tx.customerPaymentEvent.update({
            where: { id: customerPaymentEvent.id },
            data: { progress: finalProgress }
          });
        } catch (error) {
          throw {
            code: 'INVOICE_CREATION_FAILED',
            message: 'Failed to create invoice',
            details: error
          } as AssignmentError;
        }
      }

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'create',
          entityType: 'CustomerPaymentEvent',
          entityId: customerPaymentEvent.id,
          changes: {
            type: 'ASSIGNMENT',
            originalAmount,
            customAmount: input.amount,
            reason: input.reason,
            invoiceGenerated: shouldCreateInvoiceNow,
            invoiceId: finalProgress.invoiceId
          }
        }
      });

      return {
        customerPaymentEvent,
        progress: finalProgress,
        invoiceCreated: shouldCreateInvoiceNow
      };
    });

    // Revalidate relevant paths
    revalidatePath('/payment-events');
    revalidatePath(`/customers/${input.customerId}`);

    return { success: true, data: result };
  } catch (error) {
    console.error('Error assigning one-time payment:', error);

    if ((error as AssignmentError).code) {
      return {
        success: false,
        error: error as AssignmentError
      };
    }

    return {
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'An unexpected error occurred',
        details: error
      }
    };
  }
}
export async function checkCustomerAssignment(input: {
  paymentEventId: string;
  customerId: string;
}) {
  try {
    const existingAssignment = await prisma.customerPaymentEvent.findFirst({
      where: {
        paymentEventId: input.paymentEventId,
        customerId: input.customerId,
        isActive: true // Add isActive filter
      }
    });

    return { exists: existingAssignment !== null };
  } catch (error) {
    console.error('Error checking assignment:', error);
    return { error: 'Failed to check existing assignment' };
  }
}

export async function getCustomersWithHierarchy() {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }
    const allCustomers = await prisma.customer.findMany({
      where: {
        status: 'ACTIVE',
        companyId: session.user.companyId,
        isActive: true // Add isActive filter
      },
      select: {
        id: true,
        displayName: true,
        parentId: true,
        status: true
      }
    });

    const customerMap = new Map();
    allCustomers.forEach((customer) => {
      customerMap.set(customer.id, {
        ...customer,
        subCustomers: []
      });
    });

    const rootCustomers: FormattedCustomer[] = [];
    allCustomers.forEach((customer) => {
      if (customer.parentId) {
        const parent = customerMap.get(customer.parentId);
        if (parent) parent.subCustomers.push(customerMap.get(customer.id));
      } else {
        rootCustomers.push(customerMap.get(customer.id));
      }
    });

    return rootCustomers;
  } catch (error) {
    console.error('Error getting customers with hierarchy:', error);
    return [];
  }
}
export async function getPaymentEventsWithRelations(): Promise<
  PaymentEventWithRelations[]
> {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }
    const paymentEvents = await prisma.paymentEvent.findMany({
      where: {
        active: true,
        companyId: session.user.companyId,
        isActive: true // Add isActive filter
      },
      include: {
        currentVersion: {
          select: {
            id: true,
            name: true,
            type: true,
            version: true,
            status: true,
            paymentSettings: true
          }
        },
        customerPaymentEvents: {
          where: { isActive: true }, // Add isActive filter for related events
          include: {
            invoices: {
              where: { isActive: true } // Add isActive filter for invoices
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return paymentEvents as PaymentEventWithRelations[];
  } catch (error) {
    console.error('Error getting payment events with relations:', error);
    return [];
  }
}
