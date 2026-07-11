'use server';

import { revalidatePath } from 'next/cache';
<<<<<<< HEAD
import { Invoice, PaymentStatus } from '@/lib/generated/prisma/client';
=======
import { headers } from 'next/headers';
import { Invoice, PaymentStatus } from '@/lib/generated/prisma/client';
import { auth } from '@/lib/auth';
>>>>>>> feat/concierge-service-platform
import { prisma } from '@/lib/prisma';

import { PaymentFormData } from './types';

export async function processPayment(
  data: PaymentFormData,
  pathToRevalidate: string
) {
  try {
<<<<<<< HEAD
=======
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) throw new Error('Unauthorized');
>>>>>>> feat/concierge-service-platform
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: {
        payments: true,
        customerPaymentEvent: true
      }
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Calculate actual total paid from all payment records, including the new one
    const existingPaymentsTotal = invoice.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const totalPaidIncludingNew = existingPaymentsTotal + data.amount;
    const remainingAfterPayment = invoice.amount - totalPaidIncludingNew;

    // Check if payment exceeds remaining balance
    if (data.amount > invoice.amount - existingPaymentsTotal) {
      throw new Error('Payment amount exceeds remaining balance');
    }

    const snapshot =
      invoice.paymentEventSnapshot as PrismaJson.PaymentEventSnapshot;

    const currentPaymentTracking = snapshot.paymentTracking ?? {
      totalPaid: 0,
      remainingBalance: invoice.amount,
      numberOfPayments: 0,
      paymentHistory: []
    };

    // Create the new payment record
    const payment = await prisma.payment.create({
      data: {
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        paymentDate: new Date(),
        invoiceId: data.invoiceId,
        customerId: invoice.customerId,
        companyId: invoice.companyId
      }
    });

    const newPaymentRecord: PrismaJson.PaymentRecord = {
      id: payment.id,
      amount: data.amount,
      date: new Date().toISOString(),
      paymentMethod: data.paymentMethod,
      reference: data.reference || undefined,
      balance: remainingAfterPayment
    };

    // Update payment tracking to match actual database state
    const updatedPaymentTracking = {
      totalPaid: totalPaidIncludingNew,
      remainingBalance: remainingAfterPayment,
      lastPaymentDate: new Date().toISOString(),
      numberOfPayments: currentPaymentTracking.numberOfPayments + 1,
      paymentHistory: [
        ...currentPaymentTracking.paymentHistory,
        newPaymentRecord
      ]
    };

    // Determine invoice status with more precise comparison
    const newStatus =
      Math.abs(remainingAfterPayment) < 0.01
        ? 'PAID'
        : totalPaidIncludingNew > 0 && totalPaidIncludingNew < invoice.amount
          ? 'PARTIAL'
          : 'PENDING';

    await prisma.invoice.update({
      where: { id: data.invoiceId },
      data: {
        status: newStatus,
        paymentEventSnapshot: {
          ...snapshot,
          paymentTracking: updatedPaymentTracking
        }
      }
    });

    if (newStatus === 'PAID' && invoice.customerPaymentEvent) {
      await updatePaymentEventStatus(invoice.customerPaymentEvent.id);
    }

    revalidatePath(pathToRevalidate);

    // Revalidate all common paths that might display invoices
    revalidatePath('/finance/payment-events');
    revalidatePath('/invoices');
    revalidatePath('/dashboard');
    revalidatePath('/');

    // If we're on a specific invoice detail page
    if (data.invoiceId) {
      revalidatePath(`/invoices/${data.invoiceId}`);
    }

    return {
      success: true,
      payment,
      remainingBalance: updatedPaymentTracking.remainingBalance,
      paymentHistory: updatedPaymentTracking.paymentHistory,
      status: newStatus // Add status to the return value
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    throw new Error('Failed to process payment', { cause: error });
  }
}

async function updatePaymentEventStatus(customerPaymentEventId: string) {
  const customerPaymentEvent = await prisma.customerPaymentEvent.findUnique({
    where: { id: customerPaymentEventId },
    include: {
      invoices: true,
      paymentEvent: {
        include: {
          currentVersion: true
        }
      }
    }
  });

  if (!customerPaymentEvent) return;

  if (customerPaymentEvent.paymentEvent.currentVersion!.type === 'ONE_TIME') {
    await updateOneTimePaymentStatus(customerPaymentEvent);
  } else if (
    customerPaymentEvent.paymentEvent.currentVersion!.type === 'SUBSCRIPTION'
  ) {
    await updateSubscriptionStatus(customerPaymentEvent);
  }
}

async function updateOneTimePaymentStatus(customerPaymentEvent: any) {
  const isPaid = customerPaymentEvent.invoices.every(
    (invoice: Invoice) => invoice.status === 'PAID'
  );

  await prisma.customerPaymentEvent.update({
    where: { id: customerPaymentEvent.id },
    data: {
      status: isPaid ? 'PAID' : 'PENDING'
    }
  });
}
function isCurrentlyPaused(progress: PrismaJson.SubscriptionProgress): boolean {
  if (!progress.currentPause) return false;

  const pauseStart = new Date(progress.currentPause.startDate);
  const pauseEnd = progress.currentPause.endDate
    ? new Date(progress.currentPause.endDate)
    : null;

  return new Date() >= pauseStart && (!pauseEnd || new Date() <= pauseEnd);
}
function isInTrialPeriod(
  progress: PrismaJson.SubscriptionProgress,
  settings: PrismaJson.SubscriptionSettings
): boolean {
  if (!settings.trialPeriodDays) return false;

  const trialEnd = new Date(progress.effectiveStartDate);
  trialEnd.setDate(trialEnd.getDate() + settings.trialPeriodDays);

  return new Date() <= trialEnd;
}
async function updateSubscriptionStatus(customerPaymentEvent: any) {
  const currentDate = new Date();
  const progress =
    customerPaymentEvent.progress as PrismaJson.SubscriptionProgress;
  const settings = customerPaymentEvent.paymentEvent.currentVersion
    .paymentSettings.settings as PrismaJson.SubscriptionSettings;

  // 1. Check if subscription has ended
  const hasEnded = progress.endDate && new Date(progress.endDate) < currentDate;
  if (hasEnded) {
    return updateStatus(
      customerPaymentEvent.id,
      'CANCELLED' as PaymentStatus,
      'subscription_ended'
    );
  }

  // 2. Check if subscription is paused
  if (isCurrentlyPaused(progress)) {
    return updateStatus(
      customerPaymentEvent.id,
      'PENDING' as PaymentStatus,
      'subscription_paused'
    );
  }

  // 3. Check trial period
  if (isInTrialPeriod(progress, settings)) {
    const unpaidTrialInvoices = customerPaymentEvent.invoices.some(
      (inv: Invoice) => inv.dueDate <= currentDate && inv.status !== 'PAID'
    );
    return updateStatus(
      customerPaymentEvent.id,
      unpaidTrialInvoices ? 'PENDING' : ('PAID' as PaymentStatus),
      'in_trial'
    );
  }

  // 4. Check regular subscription status
  const sortedInvoices = customerPaymentEvent.invoices.sort(
    (a: Invoice, b: Invoice) => a.dueDate.getTime() - b.dueDate.getTime()
  );

  const dueInvoices = sortedInvoices.filter(
    (inv: Invoice) => inv.dueDate <= currentDate
  );
  const unpaidDueInvoices = dueInvoices.filter(
    (inv: Invoice) => inv.status !== 'PAID'
  );

  let newStatus: PaymentStatus;
  let reason = '';

  if (unpaidDueInvoices.length > 0) {
    const severelyOverdue = unpaidDueInvoices.some((inv: Invoice) => {
      const daysOverdue = Math.floor(
        (currentDate.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysOverdue > 30;
    });

    newStatus = severelyOverdue ? 'OVERDUE' : 'PARTIAL';
    reason = severelyOverdue
      ? 'payment_severely_overdue'
      : 'payment_partially_due';
  } else if (dueInvoices.length > 0) {
    newStatus = 'PAID';
    reason = 'current_period_paid';
  } else {
    newStatus = 'PENDING';
    reason = 'awaiting_next_period';
  }

  await updateStatus(customerPaymentEvent.id, newStatus, reason);
}

async function updateStatus(
  customerPaymentEventId: string,
  paymentStatus: PaymentStatus,
  reason: string
) {
  // First get the current progress
  const customerPaymentEvent = await prisma.customerPaymentEvent.findUnique({
    where: { id: customerPaymentEventId }
  });

  if (!customerPaymentEvent) return;

  // Cast the progress to SubscriptionProgress type
  const currentProgress =
    customerPaymentEvent.progress as PrismaJson.SubscriptionProgress;

  // Map the payment status to subscription status
  const subscriptionStatus = mapPaymentToSubscriptionStatus(paymentStatus);

  // Create new history record with correct type
  const newHistoryRecord: PrismaJson.StatusHistoryRecord = {
    status: subscriptionStatus,
    date: new Date().toISOString(),
    reason
  };

  const updatedProgress: PrismaJson.SubscriptionProgress = {
    ...currentProgress,
    subscriptionStatus,
    statusHistory: [...(currentProgress.statusHistory || []), newHistoryRecord],
    lastProcessedDate: new Date().toISOString()
  };

  await prisma.customerPaymentEvent.update({
    where: { id: customerPaymentEventId },
    data: {
      status: paymentStatus,
      progress: updatedProgress
    }
  });
}
function mapPaymentToSubscriptionStatus(
  paymentStatus: PaymentStatus
): PrismaJson.SubscriptionStatus {
  switch (paymentStatus) {
    case 'PAID':
      return 'ACTIVE';
    case 'OVERDUE':
      return 'ACTIVE'; // Still active but needs attention
    case 'PARTIAL':
      return 'ACTIVE'; // Still active with partial payment
    case 'CANCELLED':
      return 'CANCELLED';
    case 'PENDING':
      return 'ACTIVE'; // Active but awaiting payment
    default:
      return 'ACTIVE';
  }
}

// Add this new function to fetch the latest invoice data
export async function getLatestInvoiceData(invoiceId: string) {
  try {
<<<<<<< HEAD
=======
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) throw new Error('Unauthorized');

>>>>>>> feat/concierge-service-platform
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId }
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return {
      success: true,
      invoice
    };
  } catch (error) {
    console.error('Error fetching invoice data:', error);
    return {
      success: false,
      error: 'Failed to fetch invoice data'
    };
  }
}
