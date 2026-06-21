import { DiscountApplicationTime, DiscountType } from '@/lib/generated/prisma/client';

export type Invoice = {
  id: string;
  number: string;

  customer: {
    id: string;
    displayName: string | null;
    primaryEmail: string | null;
    level: number;
  };
  amount: number;
  taxRate: number;
  dueDate: Date;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'PARTIAL' | 'OVERDUE';
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
export interface InvoiceFormProps {
  mode: 'create' | 'edit';
  initialData?: Invoice;
  company?: CompanyInfo | null;
}
export interface CompanyInfo {
  name: string;
  legalName?: string | null;
  taxId?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: any;
  logo?: string | null;
}

export interface InvoiceAction {
  id: string;
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
    invoiceId: string;
  }[];
  customer: {
    displayName: string | null;
    primaryEmail: string | null;
  };
  attachments: {
    id: string;
    fileId: string;
    invoiceId: string;
  }[];
  status: string;
  amount: number;
}
export interface UpdateInvoiceData extends BaseInvoiceInput {
  files?: FileWithPreview[];
  removedAttachmentIds?: string[];
}
interface InvoiceItemInput {
  id: string;
  productName: string;
  description?: string;
  quantity: number;
  rate: number;
  sku: string | null;
  taxable: boolean;
  itemId: string | null;
}

export interface BaseInvoiceInput {
  customerId: string;

  dueDate: Date;
  notes?: string;
  emailCustomer?: string | null;
  customerAddress: PrismaJson.Address;
  taxId?: string;
  items: InvoiceItemInput[];
  discountType: DiscountType | null;
  discountValue: number;
  ccEmail: string;
  discountApplicationTime: DiscountApplicationTime;
}

export type CreateInvoiceResponse =
  | { success: true; data: InvoiceAction }
  | { success: false; error: string };

// Shared Types
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

export interface CreateInvoiceData extends BaseInvoiceInput {
  files?: FileWithPreview[];
}
export interface InvoiceItem {
  id: string;
  productName: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
  taxable: boolean;
  sku: string | null;
}
