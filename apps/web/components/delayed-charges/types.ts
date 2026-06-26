import {
  DiscountApplicationTime,
  DiscountType,
  ChargeStatus
} from '@/lib/generated/prisma/enums';
import { CompanyInfo, FileWithPreview } from '../invoice/types';

export type DelayedCharge = {
  id: string;
  number: string;
  status: ChargeStatus;
  customer: {
    id: string;
    displayName: string | null;
    primaryEmail: string | null;
    level: number;
  };
  amount: number;
  taxRate: number;
  dueDate: Date;
  notes: string | null;
  paymentEventSnapshot?: PrismaJson.PaymentEventSnapshot;
  emailCustomer: string | null;
  discountType: DiscountType | null;
  discountValue: number | null;
  discountAmount: number;
  discountApplicationTime: DiscountApplicationTime | null;
  items: {
    id: string;
    productName: string;
    description: string | null;
    quantity: number;
    rate: number;
    amount: number;
    sku: string | null;
    taxable: boolean;
    itemId: string | null;
  }[];
  attachments: {
    id: string;
    fileId: string;
    file: {
      id: string;
      filename: string;
      path: string;
      mimetype: string;
      size: number;
    };
  }[];
  taxId: string | null;
  tax: {
    id: string;
    name: string;
    rate: number;
    agencyName: string;
    description: string | null;
  } | null;
  taxAmount: number;
  createdAt: Date;
  updatedAt: Date;
};

export interface DelayedChargeFormProps {
  mode: 'create' | 'edit';
  initialData?: DelayedCharge;
  company?: CompanyInfo | null;
}

export interface DelayedChargeAction {
  id: string;
  status: ChargeStatus;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | null;
  discountValue: number | null;
  discountApplicationTime: 'BEFORE_TAX' | 'AFTER_TAX' | null;
  discountAmount: number;
  number: string;
  taxId: string | null;
  tax: {
    id: string;
    name: string;
    rate: number;
    agencyName: string;
    description: string | null;
  } | null;
  taxAmount: number;
  items: {
    id: string;
    amount: number;
    createdAt: Date;
    updatedAt: Date;
    productName: string;
    description: string | null;
    quantity: number;
    rate: number;
    sku: string | null;
    taxable: boolean;
    itemId: string | null;
    delayedChargeId: string;
  }[];
  customer: {
    displayName: string | null;
    primaryEmail: string | null;
  };
  attachments: {
    id: string;
    fileId: string;
    delayedChargeId: string;
  }[];
  amount: number;
}

export interface BaseDelayedChargeInput {
  customerId: string;
  status: ChargeStatus;
  dueDate: Date;
  notes?: string;
  emailCustomer?: string | null;
  customerAddress: PrismaJson.Address;
  taxId?: string;
  items: DelayedChargeItemInput[];
  discountType: DiscountType | null;
  discountValue: number;
  ccEmail: string;
  discountApplicationTime: DiscountApplicationTime;
}

export interface DelayedChargeItemInput {
  id: string;
  productName: string;
  description?: string;
  quantity: number;
  rate: number;
  sku: string | null;
  taxable: boolean;
  itemId: string | null;
}

export interface UpdateDelayedChargeData extends BaseDelayedChargeInput {
  files?: FileWithPreview[];
  removedAttachmentIds?: string[];
}

export type CreateDelayedChargeResponse =
  | { success: true; data: DelayedChargeAction }
  | { success: false; error: string };

// Reuse FileWithPreview interface

export interface CreateDelayedChargeData extends BaseDelayedChargeInput {
  files?: FileWithPreview[];
}

export interface DelayedChargeItem {
  id: string;
  productName: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
  taxable: boolean;
  sku: string | null;
}
