import {
  DiscountApplicationTime,
  DiscountType,
  PaymentMethod,
  ReceiptStatus
} from '@/lib/generated/prisma/enums';
import { CompanyInfo } from '../invoice/types';

export interface SalesFormProps {
  mode?: 'create' | 'edit';
  initialData?: SalesReceipt;
  company?: CompanyInfo | null;
}

export interface SalesReceiptItem {
  id?: string;
  productName: string;
  description?: string | null;
  quantity: number;
  rate: number;
  amount?: number;
  taxable: boolean;
  itemId: string | null;
  sku?: string | null;
}

export interface SalesReceipt {
  id: string;
  number: string;
  customerId: string;
  paymentMethod: PaymentMethod;
  status: ReceiptStatus;
  amount: number;
  taxAmount: number;
  discountType: DiscountType | null;
  discountValue: number | null;
  discountAmount: number;
  discountApplicationTime: DiscountApplicationTime | null;
  paymentEventSnapshot?: PrismaJson.PaymentEventSnapshot;
  dueDate: Date;
  notes: string | null;
  emailCustomer: string | null;
  ccEmail?: string | null;
  taxId: string | null;
  taxRate: number;
  items: SalesReceiptItem[];
  customer: {
    id: string;
    displayName: string | null;
    primaryEmail: string | null;
    level: number;
  };
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
  tax?: {
    id: string;
    name: string;
    rate: number;
    agencyName: string | null;
    description: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesReceiptAction {
  id: string;
  number: string;
  paymentMethod: PaymentMethod;
  status: ReceiptStatus;
  discountType: DiscountType | null;
  discountValue: number | null;
  discountApplicationTime: DiscountApplicationTime | null;
  discountAmount: number;
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
    salesReceiptId: string;
  }[];
  customer: {
    displayName: string | null;
    primaryEmail: string | null;
  };
  attachments: {
    id: string;
    fileId: string;
    salesReceiptId: string;
  }[];
  amount: number;
}

export interface BaseSalesReceiptInput {
  customerId: string;
  paymentMethod: PaymentMethod;
  status: ReceiptStatus;
  dueDate: Date;
  notes?: string;
  emailCustomer?: string | null;
  ccEmail: string;
  customerAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  taxId?: string;
  items: SalesReceiptItem[];
  discountType: DiscountType | null;
  discountValue: number;
  discountApplicationTime: DiscountApplicationTime;
}

export interface FileWithPreview {
  id: string;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  key: string;
  file: {
    name: string;
    type: string;
    size: number;
  };
  mimetype?: string;
  size?: number;
  path?: string;
  progress?: number;
  error?: string;
  url?: string;
  fileId?: string;
}

export interface CreateSalesReceiptData extends BaseSalesReceiptInput {
  taxRate: number;
  files?: FileWithPreview[];
  removedAttachmentIds?: string[];
}

export type UpdateSalesReceiptData = CreateSalesReceiptData;

export type CreateSalesReceiptResponse =
  | { success: true; data: SalesReceiptAction }
  | { success: false; error: string };
