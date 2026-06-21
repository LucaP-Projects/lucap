import {
  DiscountApplicationTime,
  DiscountType,
  CreditMemoStatus,
  CreditMemoReason
} from '@/lib/generated/prisma/client';
import { CompanyInfo, FileWithPreview } from '../invoice/types';

export type CreditMemo = {
  id: string;
  number: string;
  status: CreditMemoStatus;
  reason: CreditMemoReason;
  originalInvoiceId?: string;
  customer: {
    id: string;
    displayName: string | null;
    primaryEmail: string | null;
    level: number;
  };
  amount: number;
  taxRate: number;
  issueDate: Date;
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

export interface CreditMemoFormProps {
  mode: 'create' | 'edit';
  initialData?: CreditMemo;
  company?: CompanyInfo | null;
}

export interface CreditMemoAction {
  id: string;
  dueDate: Date;
  status: CreditMemoStatus;
  reason: CreditMemoReason;
  originalInvoiceId?: string | null;
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
    creditMemoId: string;
  }[];
  customer: {
    displayName: string | null;
    primaryEmail: string | null;
  };
  attachments: {
    id: string;
    fileId: string;
    creditMemoId: string;
  }[];
  amount: number;
}

export interface BaseCreditMemoInput {
  customerId: string;
  status: CreditMemoStatus;
  reason: CreditMemoReason;
  issueDate: Date;
  dueDate: Date;
  originalInvoiceId?: string;
  notes?: string;
  emailCustomer?: string | null;
  customerAddress: PrismaJson.Address;
  taxId?: string;
  items: CreditMemoItemInput[];
  discountType: DiscountType | null;
  discountValue: number;
  ccEmail: string;
  discountApplicationTime: DiscountApplicationTime;
}

export interface CreditMemoItemInput {
  id: string;
  productName: string;
  description?: string;
  quantity: number;
  rate: number;
  sku: string | null;
  taxable: boolean;
  itemId: string | null;
}

export interface UpdateCreditMemoData extends BaseCreditMemoInput {
  files?: FileWithPreview[];
  removedAttachmentIds?: string[];
}

export type CreateCreditMemoResponse =
  | { success: true; data: CreditMemoAction }
  | { success: false; error: string };

export interface CreateCreditMemoData extends BaseCreditMemoInput {
  files?: FileWithPreview[];
}

export interface CreditMemoItem {
  id: string;
  productName: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
  taxable: boolean;
  sku: string | null;
}
