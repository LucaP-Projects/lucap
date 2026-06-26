import { PaymentFrequency, VersionStatus } from '@/lib/generated/prisma/browser';

interface BaseSchedule {
  totalAmount: number;
  type: PaymentFrequency;
  dueDate: string;
  initialFee?: {
    amount: number;
    description?: string;
    dueDate?: string;
  };
}

interface PaymentEventVersion {
  id: string;
  name: string;
  description?: string;
  amount: number;
  type: PaymentFrequency;
  version: number;
  status: VersionStatus;
  isRequired: boolean;
  baseSchedule: BaseSchedule;
}

interface PaymentEvent {
  id: string;
  active: boolean;
  versionId: string | null;
  currentVersion: PaymentEventVersion;
}

export type { PaymentEvent, PaymentEventVersion, BaseSchedule };

export enum AdjustmentStrategy {
  DISTRIBUTE_TO_FUTURE = 'DISTRIBUTE_TO_FUTURE',
  APPEND_TO_REMAINING = 'APPEND_TO_REMAINING',
  LAST_INSTALLMENT = 'LAST_INSTALLMENT',
  NEXT_INSTALLMENT = 'NEXT_INSTALLMENT',
  WEIGHTED_DISTRIBUTION = 'WEIGHTED_DISTRIBUTION',
  PROPORTIONAL_REMAINING = 'PROPORTIONAL_REMAINING',
  FIXED_FIRST = 'FIXED_FIRST'
}
