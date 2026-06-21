// lib/payment-schedule.ts
import { PaymentStatus } from '@/lib/generated/prisma/client';
import { format } from 'date-fns';

export function getBaseScheduleInfo(baseSchedule: any) {
  const scheduleInfo = [];

  if (baseSchedule.type === 'ONE_TIME') {
    scheduleInfo.push(
      `Due on ${format(new Date(baseSchedule.dueDate), 'PPP')}`
    );
  }

  if (baseSchedule.type === 'SUBSCRIPTION') {
    scheduleInfo.push(
      `${baseSchedule.intervalAmount} per ${baseSchedule.intervalUnit.toLowerCase()}`,
      `Starts on ${format(new Date(baseSchedule.startDate), 'PPP')}`
    );
    if (baseSchedule.endDate) {
      scheduleInfo.push(
        `Ends on ${format(new Date(baseSchedule.endDate), 'PPP')}`
      );
    }
    if (baseSchedule.anchorDay) {
      scheduleInfo.push(
        `Anchored to day ${baseSchedule.anchorDay} of the period`
      );
    }
  }

  if (baseSchedule.type === 'INSTALLMENTS') {
    scheduleInfo.push(
      `${baseSchedule.numberOfInstallments} installments `,
      `From ${format(new Date(baseSchedule.startDate), 'PPP')}`,
      ` To ${format(new Date(baseSchedule.endDate), 'PPP')}`
    );
  }

  if (baseSchedule.initialFee) {
    scheduleInfo.push(
      ` Initial fee: ${formatCurrency(baseSchedule.initialFee.amount)}`,
      baseSchedule.initialFee.dueDate
        ? `Initial fee due: ${format(new Date(baseSchedule.initialFee.dueDate), 'PPP')}`
        : 'Initial fee due immediately'
    );
  }

  return scheduleInfo;
}

// lib/utils.ts
export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);

export const paymentStatusColorMap: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-500 hover:bg-yellow-600',
  PAID: 'bg-green-500 hover:bg-green-600',
  OVERDUE: 'bg-red-500 hover:bg-red-600',
  CANCELLED: 'bg-gray-500 hover:bg-gray-600',
  PARTIAL: 'bg-blue-500 hover:bg-blue-600'
} as const;

export const paymentStatusConfig: Record<
  PaymentStatus,
  {
    label: string;
    color: string;
    icon: string;
  }
> = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-500 hover:bg-yellow-600',
    icon: 'Clock'
  },
  PAID: {
    label: 'Paid',
    color: 'bg-green-500 hover:bg-green-600',
    icon: 'CheckCircle'
  },
  OVERDUE: {
    label: 'Overdue',
    color: 'bg-red-500 hover:bg-red-600',
    icon: 'AlertCircle'
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-gray-500 hover:bg-gray-600',
    icon: 'XCircle'
  },
  PARTIAL: {
    label: 'Partial',
    color: 'bg-blue-500 hover:bg-blue-600',
    icon: 'ExclamationCircle'
  }
} as const;

export function getPaymentStatusColor(status: PaymentStatus): string {
  return paymentStatusColorMap[status];
}

export function getPaymentStatusConfig(status: PaymentStatus) {
  return paymentStatusConfig[status];
}
