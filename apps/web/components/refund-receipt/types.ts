import {
  DiscountApplicationTime,
  DiscountType,
  PaymentMethod,
  RefundReason,
  RefundStatus
} from '@/lib/generated/prisma/client';
import { CompanyInfo } from '../invoice/types';

export interface RefundFormProps {
  mode?: 'create' | 'edit';
  initialData?: RefundReceipt;
  company?: CompanyInfo | null;
}

export interface RefundReceiptItem {
  id?: string;
  productName: string;
  description?: string | null;
  quantity: number;
  rate: number;
  amount?: number;
  taxable: boolean;
  itemId: string | null; // Updated to allow null
  sku?: string | null;
}

export interface RefundReceipt {
  id: string;
  number: string;
  customerId: string;
  refundMethod: PaymentMethod;
  originalPaymentMethod: PaymentMethod | null; // Fixed the typo here
  refundRef: string | null;
  reason: RefundReason;
  status: RefundStatus;
  amount: number;
  taxAmount: number;
  discountType: DiscountType | null;
  discountValue: number | null; // Updated to allow null
  discountAmount: number;
  discountApplicationTime: DiscountApplicationTime | null; // Also made nullable to be safe
  paymentEventSnapshot?: PrismaJson.PaymentEventSnapshot;
  dueDate: Date;
  notes: string | null;
  emailCustomer: string | null;
  ccEmail?: string | null;
  taxId: string | null;
  taxRate: number;
  items: RefundReceiptItem[];
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

export interface RefundReceiptAction {
  id: string;
  number: string;
  refundMethod: PaymentMethod;
  originalPaymentMethod: PaymentMethod | null;
  reason: RefundReason;
  status: RefundStatus;
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
    refundReceiptId: string;
  }[];
  customer: {
    displayName: string | null;
    primaryEmail: string | null;
  };
  attachments: {
    id: string;
    fileId: string;
    refundReceiptId: string;
  }[];
  amount: number;
}

export interface BaseRefundReceiptInput {
  customerId: string;
  refundMethod: PaymentMethod;
  originalPaymentMethod: PaymentMethod | null;
  reason: RefundReason;
  status: RefundStatus;
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
  items: RefundReceiptItem[];
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

export interface CreateRefundReceiptData extends BaseRefundReceiptInput {
  originalReceiptId?: string;
  originalInvoiceId?: string;
  refundRef?: string;
  taxRate: number;
  files?: FileWithPreview[];
  removedAttachmentIds?: string[];
}

export type UpdateRefundReceiptData = CreateRefundReceiptData;

export type CreateRefundReceiptResponse =
  | { success: true; data: RefundReceiptAction }
  | { success: false; error: string };
