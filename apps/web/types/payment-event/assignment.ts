import { FormattedCustomer, PaymentEventWithRelations } from './table';

export interface PaymentSettings {
  settings: {
    amount: number;
  };
}

export interface PaymentEventVersion {
  paymentSettings: PaymentSettings;
}

// Props Types
export interface PriceModificationProps {
  originalAmount: number;
  customAmount: number;
  setCustomAmount: (amount: number) => void;
  reason: string;
  setReason: (reason: string) => void;
  isPriceModified: boolean;
  priceDifference: number;
}

export interface CustomerItemProps {
  customer: FormattedCustomer;
  level?: number;
  selectedId: string | null;
  onSelect: (customer: FormattedCustomer) => void;
  searchTerm: string;
}

export interface OneTimeAssignFormProps {
  event: PaymentEventWithRelations;
  customers: FormattedCustomer[];
  onClose: () => void;
  isLoading?: boolean;
}
