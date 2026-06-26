import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
  startOfYear,
  endOfYear
} from 'date-fns';
import {
  EstimateStatus,
  CreditMemoStatus,
  ReceiptStatus,
  RefundStatus,
  ChargeStatus,
  CreditStatus,
  PaymentStatus
} from '@/lib/generated/prisma/enums';

// Type mapping for different status types
export type EntityStatus =
  | EstimateStatus
  | CreditMemoStatus
  | ReceiptStatus
  | RefundStatus
  | ChargeStatus
  | CreditStatus
  | PaymentStatus;

// Enhanced status color mapping
export const STATUS_COLORS = {
  // Estimate Status Colors
  DRAFT: 'bg-gray-500',
  SENT: 'bg-blue-500',
  ACCEPTED: 'bg-green-500',
  REJECTED: 'bg-red-500',
  EXPIRED: 'bg-yellow-500',
  CONVERTED: 'bg-purple-500',

  // Credit Memo Status Colors
  ISSUED: 'bg-blue-500',
  APPLIED: 'bg-green-500',
  VOID: 'bg-red-500',

  // Receipt Status Colors
  COMPLETED: 'bg-green-500',
  VOIDED: 'bg-red-500',
  REFUNDED: 'bg-yellow-500',

  // Refund Status Colors
  PENDING: 'bg-yellow-500',
  PROCESSED: 'bg-green-500',
  CANCELLED: 'bg-gray-500',

  // Charge Status Colors
  INVOICED: 'bg-blue-500',
  CANCELED: 'bg-red-500',

  // Credit Status Colors
  CREDITED: 'bg-green-500',

  // Payment Status Colors
  PAID: 'bg-green-500',
  PARTIAL: 'bg-blue-500',
  OVERDUE: 'bg-red-500'
} as const;

export type EntityType =
  | 'estimate'
  | 'creditMemo'
  | 'receipt'
  | 'refund'
  | 'charge'
  | 'credit'
  | 'payment'
  | 'invoice';

export function getStatusColor<T extends EntityStatus>(
  status: T,
  entityType?: EntityType
): string {
  const defaultColor = 'bg-gray-500';

  if (status in STATUS_COLORS) {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS];
  }

  return defaultColor;
}

export function formatStatus(status: EntityStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ');
}
interface DateRange {
  from: Date;
  to: Date;
}

const dateRanges = [
  { label: 'All Time', value: 'all_time' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'this_week' },
  { label: 'Last Week', value: 'last_week' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'This Quarter', value: 'this_quarter' },
  { label: 'Last Quarter', value: 'last_quarter' },
  { label: 'Last 6 Months', value: 'last_6_months' },
  { label: 'Last 12 Months', value: 'last_12_months' },
  { label: 'This Year', value: 'this_year' }
];

const getDateRange = (
  range: string
): DateRange | { from: undefined; to: undefined } => {
  const today = new Date();

  switch (range) {
    case 'all_time':
      return {
        from: new Date(0), // Unix epoch start
        to: new Date('9999-12-31') // Far future date
      };
    case 'today':
      return {
        from: startOfDay(today),
        to: endOfDay(today)
      };

    case 'yesterday': {
      const yesterday = subDays(today, 1);
      return {
        from: startOfDay(yesterday),
        to: endOfDay(yesterday)
      };
    }

    case 'this_week':
      return {
        from: startOfWeek(today, { weekStartsOn: 1 }), // Start week on Monday
        to: endOfDay(today)
      };

    case 'last_week': {
      const lastWeekStart = subDays(startOfWeek(today, { weekStartsOn: 1 }), 7);
      const lastWeekEnd = subDays(endOfWeek(today, { weekStartsOn: 1 }), 7);
      return {
        from: lastWeekStart,
        to: lastWeekEnd
      };
    }

    case 'this_month':
      return {
        from: startOfMonth(today),
        to: endOfDay(today)
      };

    case 'last_month': {
      const lastMonth = subMonths(today, 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth)
      };
    }

    case 'this_quarter':
      return {
        from: startOfQuarter(today),
        to: endOfDay(today)
      };

    case 'last_quarter': {
      const lastQuarter = subQuarters(today, 1);
      return {
        from: startOfQuarter(lastQuarter),
        to: endOfQuarter(lastQuarter)
      };
    }

    case 'last_6_months': {
      const sixMonthsAgo = subMonths(today, 6);
      return {
        from: startOfMonth(sixMonthsAgo),
        to: endOfDay(today)
      };
    }

    case 'last_12_months': {
      const twelveMonthsAgo = subMonths(today, 12);
      return {
        from: startOfMonth(twelveMonthsAgo),
        to: endOfDay(today)
      };
    }

    case 'this_year':
      return {
        from: startOfYear(today),
        to: endOfYear(today)
      };

    default:
      return { from: undefined, to: undefined };
  }
};

// Helper function to format date range for display
const formatDateRange = (range: DateRange): string =>
  `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`;

export { dateRanges, getDateRange, formatDateRange, type DateRange };
