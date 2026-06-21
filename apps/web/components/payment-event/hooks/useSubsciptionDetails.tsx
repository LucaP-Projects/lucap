import { useMemo } from 'react';
import { addDays, differenceInDays } from 'date-fns';

export const useSubscriptionDetails = (
  settings: PrismaJson.SubscriptionSettings | null,
  startDate: Date | null,
  originalAmount: number,
  initialFee: { amount: number } | undefined
) =>
  useMemo(() => {
    if (!settings) return null;

    const {
      frequency,
      trialPeriodDays,
      anchorConfig,
      useAnchorDate,
      allowPause
    } = settings;

    const startDateObj = startDate ? new Date(startDate) : new Date();
    let firstFullPaymentDate = startDateObj;
    let partialPeriodAmount = null;
    let partialPeriodDays = 0;
    let nextAnchorDate = null;

    // Only calculate anchor date related values if useAnchorDate is true
    if (useAnchorDate && anchorConfig) {
      if (anchorConfig.type === 'monthly') {
        const anchorDay =
          typeof anchorConfig.day === 'number' ? anchorConfig.day : 28;
        nextAnchorDate = new Date(
          startDateObj.getFullYear(),
          startDateObj.getMonth(),
          anchorDay
        );
        if (nextAnchorDate <= startDateObj) {
          nextAnchorDate.setMonth(nextAnchorDate.getMonth() + 1);
        }
      } else if (anchorConfig.type === 'weekly') {
        const daysUntilAnchor =
          (anchorConfig.day - startDateObj.getDay() + 7) % 7;
        nextAnchorDate = addDays(startDateObj, daysUntilAnchor);
      }

      // Calculate partial period details
      if (nextAnchorDate) {
        partialPeriodDays = differenceInDays(nextAnchorDate, startDateObj);
        const fullPeriodDays = frequency.unit === 'MONTH' ? 30 : 7;
        partialPeriodAmount =
          (originalAmount / fullPeriodDays) * partialPeriodDays;
        firstFullPaymentDate = nextAnchorDate;
      }
    } else {
      // For non-anchor subscriptions, first full payment is on start date
      firstFullPaymentDate = startDateObj;
    }

    // Adjust for trial period
    if (trialPeriodDays) {
      const trialEndDate = addDays(startDateObj, trialPeriodDays);
      if (!partialPeriodAmount) {
        firstFullPaymentDate = trialEndDate;
      }
    }

    return {
      frequency,
      trialPeriodDays,
      anchorConfig,
      useAnchorDate,
      allowPause,
      firstFullPaymentDate: firstFullPaymentDate.toISOString().split('T')[0],
      nextAnchorDate: nextAnchorDate?.toISOString().split('T')[0],
      partialPeriodAmount: partialPeriodAmount
        ? Math.round(partialPeriodAmount * 100) / 100
        : null,
      partialPeriodDays,
      hasInitialFee: !!initialFee
    };
  }, [settings, startDate, originalAmount, initialFee]);
