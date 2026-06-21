import { subDays, subWeeks, subMonths, subYears, startOfDay } from 'date-fns';
import { FormattedCustomer } from '@/types/payment-event/table';

import { useSubscriptionDetails } from '../hooks/useSubsciptionDetails';
import { FrequencyConfig } from './subscription/types';

export const validateStartDate = (
  date: Date | null,
  frequency: FrequencyConfig
): boolean => {
  if (!date) return false;
  const today = startOfDay(new Date());
  // Allow registration within one billing cycle in the past
  const earliestAllowed = subPeriod(today, frequency); // Helper function to subtract one period
  return startOfDay(date) >= earliestAllowed;
};
export const subPeriod = (date: Date, frequency: FrequencyConfig): Date => {
  switch (frequency.unit) {
    case 'DAY':
      return subDays(date, frequency.value);

    case 'WEEK':
      return subWeeks(date, frequency.value);

    case 'MONTH':
      return subMonths(date, frequency.value);

    case 'YEAR':
      return subYears(date, frequency.value);

    default:
      throw new Error(`Unsupported frequency unit: ${frequency.unit}`);
  }
};
export const isFormValid = ({
  selectedCustomer,
  startDate,
  settings,
  isPriceModified,
  reason,
  isInitialFeeModified,
  initialFeeReason,
  customPartialAmount,
  subscriptionDetails,
  partialAmountReason
}: {
  selectedCustomer: FormattedCustomer | null;
  startDate: Date | null;
  settings: PrismaJson.SubscriptionSettings;
  isPriceModified: boolean;
  reason: string;
  isInitialFeeModified: boolean;
  initialFeeReason: string;
  customPartialAmount: number;
  subscriptionDetails: ReturnType<typeof useSubscriptionDetails>;
  partialAmountReason: string;
}): boolean => {
  // Basic required fields
  if (!selectedCustomer || !startDate) {
    return false;
  }

  // Price modification validation
  if (isPriceModified && !reason) {
    return false;
  }

  // Initial fee validation
  if (isInitialFeeModified && !initialFeeReason) {
    return false;
  }

  // Partial period validation only for anchor date cases
  if (
    settings?.useAnchorDate &&
    subscriptionDetails?.partialPeriodAmount &&
    customPartialAmount !== subscriptionDetails.partialPeriodAmount &&
    !partialAmountReason
  ) {
    return false;
  }

  return true;
};
