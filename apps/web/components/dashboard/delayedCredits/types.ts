import { CreditStatus } from '@/lib/generated/prisma/client';

export interface DelayedCreditBasicCustom {
  id: string;
  number: string;
  customer: {
    displayName: string;
    primaryEmail: string | null;
  };
  amount: number;
  status: CreditStatus;
  createdAt: Date;
}

export type DelayedCreditResponseCustom = {
  data: DelayedCreditBasicCustom[];
  metadata: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
};
