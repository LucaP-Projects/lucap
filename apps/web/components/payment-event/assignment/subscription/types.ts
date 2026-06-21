export interface FrequencyConfig {
  value: number;
  unit: string;
}

export interface InitialFee {
  amount: number;
}

export interface AnchorConfig {
  type: 'monthly' | 'weekly';
  day: number | 'last';
}

export interface SubscriptionSettings {
  amount: number;
  frequency: FrequencyConfig;
  initialFee?: InitialFee;
  useAnchorDate: boolean;
  anchorConfig?: AnchorConfig;
  allowPause: boolean;
  trialPeriodDays?: number;
}

export interface SubscriptionDetailsProps {
  settings: SubscriptionSettings;
  firstPaymentAmount: number;
  totalFirstPayment: number;
  isPartialPeriod: boolean;
  daysInPartialPeriod?: number;
  nextAnchorDate?: string;
  dailyRate?: number;
}
