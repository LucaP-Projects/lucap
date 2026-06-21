import React from 'react';
import { Calendar, CreditCard } from 'lucide-react';
import { getBaseScheduleInfo } from '@/app/(finance)/finance/payment-events/[id]/utils';
import { PaymentStatus } from '@/lib/generated/prisma/client';
import { cn } from '@/lib/utils';

// Types
interface CustomerPaymentEvent {
  id: string;
  status: PaymentStatus;
}

interface PaymentStatusConfig {
  label: string;
  color: string;
}

interface PaymentStatusBreakdownProps {
  customerPaymentEvents: CustomerPaymentEvent[];
}

// Configuration
const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, PaymentStatusConfig> = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-500'
  },
  PAID: {
    label: 'Paid',
    color: 'bg-green-500'
  },
  OVERDUE: {
    label: 'Overdue',
    color: 'bg-red-500'
  },
  PARTIAL: {
    label: 'Partial',
    color: 'bg-blue-500'
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-gray-500'
  }
};

// Badge Component
export const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => {
  const config = PAYMENT_STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
        config.color.replace('bg-', 'text- bg-opacity-15')
      )}
    >
      {config.label}
    </span>
  );
};

// Main Component
export function PaymentStatusBreakdown({
  customerPaymentEvents
}: PaymentStatusBreakdownProps) {
  // Calculate status counts
  const statusCounts = customerPaymentEvents.reduce<
    Record<PaymentStatus, number>
  >(
    (acc, cpe) => {
      acc[cpe.status] = (acc[cpe.status] || 0) + 1;
      return acc;
    },
    {} as Record<PaymentStatus, number>
  );

  const total = customerPaymentEvents.length;

  const getPercentage = (count: number): number => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  // Sort statuses by count in descending order
  const sortedStatuses = Object.entries(statusCounts)
    .sort(([, a], [, b]) => b - a)
    .filter(([status]) => status in PAYMENT_STATUS_CONFIG);

  if (total === 0) {
    return (
      <div className="space-y-2">
        <h4 className="font-medium">Payment Status Breakdown</h4>
        <p className="text-muted-foreground text-sm">No payment events yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium">Payment Status Breakdown</h4>

      <div className="grid grid-cols-2 gap-2">
        {sortedStatuses.map(([status, count]) => (
          <div
            key={status}
            className="hover:bg-muted/50 flex items-center justify-between rounded-md border p-2 transition-colors"
          >
            <div className="flex items-center gap-2">
              <PaymentStatusBadge status={status as PaymentStatus} />
              <span className="text-muted-foreground text-xs">
                {getPercentage(count)}%
              </span>
            </div>
            <span className="font-medium">{count}</span>
          </div>
        ))}
      </div>

      {/* Progress bar visualization */}
      <div className="bg-muted mt-4 flex h-2 w-full overflow-hidden rounded-full">
        {sortedStatuses.map(([status, count]) => {
          const percentage = getPercentage(count);
          const config = PAYMENT_STATUS_CONFIG[status as PaymentStatus];

          return percentage > 0 ? (
            <div
              key={status}
              className={cn(config.color, 'transition-all duration-500')}
              style={{ width: `${percentage}%` }}
              title={`${config.label}: ${count} (${percentage}%)`}
            />
          ) : null;
        })}
      </div>

      {/* Summary */}
      <p className="text-muted-foreground mt-2 text-xs">
        Total: {total} payment event{total !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

// Schedule Info Component
interface ScheduleInfo {
  type: 'installment' | 'fee';
  icon: 'calendar' | 'credit-card';
  text: string;
}

export function ScheduleInfoDisplay({ baseSchedule }: { baseSchedule: any }) {
  const parseScheduleInfo = (info: string[]): ScheduleInfo[] =>
    info.map((text) => ({
      type: text.toLowerCase().includes('initial fee') ? 'fee' : 'installment',
      icon: text.toLowerCase().includes('initial fee:')
        ? 'credit-card'
        : 'calendar',
      text
    }));

  const scheduleInfo = parseScheduleInfo(getBaseScheduleInfo(baseSchedule));
  const feeInfo = scheduleInfo.filter((info) => info.type === 'fee');
  const mainScheduleInfo = scheduleInfo.filter(
    (info) => info.type === 'installment'
  );

  return (
    <div className="space-y-4">
      {mainScheduleInfo.length > 0 && (
        <InfoSection items={mainScheduleInfo} title="Installments" />
      )}
      {feeInfo.length > 0 && (
        <InfoSection items={feeInfo} title="Fee Details" />
      )}
    </div>
  );
}

const InfoSection = ({
  items,
  title
}: {
  items: ScheduleInfo[];
  title: string;
}) => (
  <div>
    <h4 className="text-muted-foreground mb-2 text-sm font-medium">
      {title}
    </h4>
    <div className="grid gap-2">
      {items.map((info, index) => (
        <div
          key={index}
          className="text-muted-foreground flex items-center gap-2 text-sm"
        >
          {info.icon === 'calendar' ? (
            <Calendar className="h-4 w-4 shrink-0" />
          ) : (
            <CreditCard className="h-4 w-4 shrink-0" />
          )}
          <span>{info.text}</span>
        </div>
      ))}
    </div>
  </div>
);