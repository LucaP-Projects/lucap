'use server';

import { addDays, differenceInDays, startOfDay } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateUniqueNumber } from '@/lib/utils';

type SubscriptionAssignmentInput = {
  paymentEventId: string;
  customerId: string;
  assignmentDate: Date;
  startDate: Date;
  regularAmount?: number;
  regularAmountReason?: string;
  initialFeeAmount?: number;
  initialFeeReason?: string;
  partialAmount?: number;
  partialAmountReason?: string;
  anchorDate?: Date;
};

type AssignmentError = {
  code:
    | 'PAYMENT_EVENT_NOT_FOUND'
    | 'INVALID_VERSION'
    | 'INVALID_SETTINGS'
    | 'CUSTOMER_NOT_FOUND'
    | 'INVOICE_CREATION_FAILED'
    | 'DATABASE_ERROR'
    | 'INVALID_AMOUNT'
    | 'INVALID_DATES'
    | 'VALIDATION_ERROR';
  message: string;
  details?: unknown;
};

type AssignmentResult = {
  success: boolean;
  data?: {
    subscriptionId: string;
    invoiceId?: string;
    startDate: string;
    effectiveStartDate: string;
    nextBillingDate: string;
    status: 'ACTIVE' | 'PENDING' | 'TRIAL';
  };
  error?: AssignmentError;
};

export async function assignSubscription(
  input: SubscriptionAssignmentInput
): Promise<AssignmentResult> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    // Fetch payment event and validate
    const paymentEvent = await prisma.paymentEvent.findUnique({
      where: { id: input.paymentEventId },
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

    if (!paymentEvent?.currentVersion) {
      throw {
        code: 'PAYMENT_EVENT_NOT_FOUND',
        message: 'Payment event or version not found'
      } as AssignmentError;
    }

    const settings = paymentEvent.currentVersion.paymentSettings
      ?.settings as PrismaJson.SubscriptionSettings;
    if (!settings) {
      throw {
        code: 'INVALID_SETTINGS',
        message: 'Invalid subscription settings'
      } as AssignmentError;
    }

    // Calculate key dates and amounts
    const effectiveStartDate = settings.trialPeriodDays
      ? addDays(startOfDay(input.startDate), settings.trialPeriodDays)
      : startOfDay(input.startDate);

    const nextAnchorDate = input.anchorDate ? new Date(input.anchorDate) : null;
    const isPartialPeriod = settings.useAnchorDate && nextAnchorDate !== null;
    const partialPeriodDays = isPartialPeriod
      ? differenceInDays(nextAnchorDate, effectiveStartDate)
      : 0;

    // Calculate amounts
    const regularAmount = input.regularAmount || settings.amount;
    const initialFeeAmount =
      input.initialFeeAmount || settings.initialFee?.amount || 0;
    const partialAmount = isPartialPeriod
      ? input.partialAmount || (regularAmount / 30) * partialPeriodDays
      : 0;

    // First invoice amount includes initial fee + first period (partial or full)
    const firstInvoiceAmount =
      initialFeeAmount + (isPartialPeriod ? partialAmount : regularAmount);

    // Initialize subscription progress
    const initialProgress: PrismaJson.SubscriptionProgress = {
      type: 'SUBSCRIPTION',
      status: 'PENDING',
      subscriptionStatus: settings.trialPeriodDays ? 'TRIAL' : 'ACTIVE',
      totalAmount: firstInvoiceAmount,
      totalPaid: 0,
      remainingBalance: firstInvoiceAmount,
      frequency: settings.frequency,
      startDate: input.startDate.toISOString(),
      endDate: null,
      nextDueDate: isPartialPeriod
        ? nextAnchorDate.toISOString()
        : effectiveStartDate.toISOString(),
      currentPeriod: 1,
      effectiveStartDate: effectiveStartDate.toISOString(),
      isInfinite: true,
      payments: [],
      statusHistory: [
        {
          status: settings.trialPeriodDays ? 'TRIAL' : 'ACTIVE',
          date: input.assignmentDate.toISOString()
        }
      ],
      pauseHistory: [],
      periods: [],
      priceModifications:
        input.regularAmount !== settings.amount
          ? [
              {
                amount: input.regularAmount || 0,
                previousAmount: settings.amount,
                effectiveDate: input.assignmentDate.toISOString(),
                reason: input.regularAmountReason,
                modifiedBy: session.user.id,
                invoiceHandling: { action: 'FUTURE_ONLY' }
              }
            ]
          : [],
      initialFeeModifications:
        initialFeeAmount !== settings.initialFee?.amount
          ? [
              {
                amount: initialFeeAmount,
                previousAmount: settings.initialFee?.amount || 0,
                effectiveDate: input.assignmentDate.toISOString(),
                reason: input.initialFeeReason,
                modifiedBy: session.user.id,
                invoiceHandling: { action: 'FUTURE_ONLY' }
              }
            ]
          : []
    };

    if (settings.useAnchorDate) {
      initialProgress.anchorConfig = settings.anchorConfig;
      initialProgress.nextAnchorDate = nextAnchorDate?.toISOString();
      if (isPartialPeriod) {
        initialProgress.currentPeriodIsPartial = true;
        initialProgress.partialPeriodDays = partialPeriodDays;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create subscription
      const subscription = await tx.customerPaymentEvent.create({
        data: {
          paymentEventId: paymentEvent.id,
          customerId: input.customerId,
          versionId: paymentEvent.currentVersion!.id,
          startDate: input.startDate,
          status: 'PENDING',
          credit: 0,
          progress: initialProgress
        }
      });

      // Create initial invoice if not in trial
      let invoice;
      if (!settings.trialPeriodDays) {
        const invoiceNumber = generateUniqueNumber();
        invoice = await tx.invoice.create({
          data: {
            number: invoiceNumber,
            customerId: input.customerId,
            paymentEventId: subscription.id,
            amount: firstInvoiceAmount,
            dueDate: effectiveStartDate,
            status: 'PENDING',
            items: {
              create: paymentEvent.currentVersion!.items.map((item) => ({
                productName: item.productName,
                description: item.description,
                quantity: item.quantity,
                rate: item.rate,
                amount: item.amount,
                taxable: item.taxable
              }))
            },
            paymentEventSnapshot: {
              id: paymentEvent.id,
              items: paymentEvent.currentVersion!.items.map((item) => ({
                productName: item.productName,
                description: item.description,
                quantity: item.quantity,
                rate: item.rate,
                amount: item.amount,
                taxable: item.taxable
              })),
              name: paymentEvent.currentVersion!.name,
              versionId: paymentEvent.currentVersion!.id,
              versionNumber: paymentEvent.currentVersion!.version,
              type: 'SUBSCRIPTION',
              snapshotTimestamp: input.assignmentDate.toISOString(),
              amount: regularAmount,
              frequency: settings.frequency,
              initialFee:
                initialFeeAmount > 0 ? { amount: initialFeeAmount } : undefined,
              snapshotData: {
                originalAmount: settings.amount,
                customAmount: input.regularAmount,
                modificationReason: input.regularAmountReason,
                partialAmount: input.partialAmount,
                partialAmountReason: input.partialAmountReason,
                anchorDate: nextAnchorDate?.toISOString(),
                trialEndDate: settings.trialPeriodDays
                  ? addDays(
                      input.startDate,
                      settings.trialPeriodDays
                    ).toISOString()
                  : undefined,
                isPartialPeriod,
                partialPeriodDays
              }
            } as PrismaJson.PaymentEventSnapshot,
            companyId: session.user.activeCompanyId
          }
        });

        // Update progress with invoice
        await tx.customerPaymentEvent.update({
          where: { id: subscription.id },
          data: {
            progress: {
              ...initialProgress,
              lastInvoiceDate: input.assignmentDate.toISOString(),
              periods: [
                {
                  periodNumber: 1,
                  startDate: effectiveStartDate.toISOString(),
                  endDate:
                    nextAnchorDate?.toISOString() ||
                    effectiveStartDate.toISOString(),
                  dueDate: effectiveStartDate.toISOString(),
                  amount: firstInvoiceAmount,
                  paid: 0,
                  remaining: firstInvoiceAmount,
                  status: 'PENDING',
                  invoiceId: invoice.id,
                  isPartialPeriod,
                  partialPeriodDays,
                  payments: []
                }
              ]
            }
          }
        });
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'create',
          entityType: 'CustomerPaymentEvent',
          entityId: subscription.id,
          changes: {
            type: 'SUBSCRIPTION_ASSIGNMENT',
            originalAmount: settings.amount,
            customAmount: regularAmount,
            reason: input.regularAmountReason,
            initialFeeAmount,
            initialFeeReason: input.initialFeeReason,
            isPartialPeriod,
            partialPeriodDays,
            partialAmount: input.partialAmount,
            partialAmountReason: input.partialAmountReason,
            trialPeriodDays: settings.trialPeriodDays,
            effectiveStartDate: effectiveStartDate.toISOString(),
            frequency: settings.frequency
          }
        }
      });

      return { subscription, invoice };
    });

    // Revalidate paths
    revalidatePath('/subscriptions');
    revalidatePath(`/customers/${input.customerId}`);
    revalidatePath(`/payment-events/${input.paymentEventId}`);

    return {
      success: true,
      data: {
        subscriptionId: result.subscription.id,
        invoiceId: result.invoice?.id,
        startDate: input.startDate.toISOString(),
        effectiveStartDate: effectiveStartDate.toISOString(),
        nextBillingDate:
          nextAnchorDate?.toISOString() || effectiveStartDate.toISOString(),
        status: settings.trialPeriodDays ? 'TRIAL' : 'ACTIVE'
      }
    };
  } catch (error) {
    console.error('Error assigning subscription:', error);

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
/**
 * Get the count of active subscriptions for a specific company
 * @param companyId The ID of the company
 * @returns The count of active subscriptions
 */
export async function getActiveSubscriptionsCount(
  companyId: string
): Promise<number> {
  if (!companyId) {
    throw new Error('Company ID is required');
  }

  try {
    // Count CustomerPaymentEvents where:
    // 1. The customer belongs to the specified company
    // 2. The progress.type is "SUBSCRIPTION"
    // 3. The progress.subscriptionStatus is in active states
    const count = await prisma.customerPaymentEvent.count({
      where: {
        customer: {
          companyId: companyId
        },
        AND: [
          {
            progress: {
              path: ['type'],
              equals: 'SUBSCRIPTION'
            }
          }
        ]
      }
    });

    return count;
  } catch (error) {
    console.error('Failed to fetch active subscriptions count:', error);
    throw new Error('Failed to fetch active subscriptions count', { cause: error });
  }
}
