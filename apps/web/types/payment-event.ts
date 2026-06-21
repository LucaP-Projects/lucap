import { PaymentFrequency, VersionStatus } from '@prisma/client';

export type SubscriptionBaseSchedule = {
  totalAmount: number;
  type: 'SUBSCRIPTION';
  intervalAmount: number;
  intervalUnit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  anchorDay?: number;
  startDate: string;
  endDate?: string;
  initialFee?: BaseScheduleInitialFee;
};
export type BaseSchedule = {
  totalAmount: number;
  type: 'ONE_TIME';
  dueDate: string;
  initialFee?: {
    amount: number;
    description?: string;
    dueDate?: string;
  };
};

export type BaseScheduleInitialFee = {
  amount: number;
  description?: string;
  dueDate?: string;
};

export type InstallmentBaseSchedule = {
  totalAmount: number;
  type: 'INSTALLMENTS';
  numberOfInstallments: number;
  startDate: string;
  endDate: string;
  schedule: {
    dueDate: string;
    amount: number;
    description?: string;
  }[];
  initialFee?: BaseScheduleInitialFee;
};

export interface PaymentEventVersion {
  id: string;
  status: VersionStatus;
  amount: number;
  type: PaymentFrequency;
  name: string;
  description?: string | null;
  isRequired: boolean;
  version: number;
}

export interface CustomerPaymentEvent {
  id: string;
  status: string;
  invoices: { id: string; status: string }[];
}

export interface PaymentEvent {
  id: string;
  active: boolean;
  versionId: string | null;
  currentVersion: PaymentEventVersion | null;
  customerPaymentEvents: CustomerPaymentEvent[];
}

export interface PaymentEventActionsProps {
  event: PaymentEvent;
}
