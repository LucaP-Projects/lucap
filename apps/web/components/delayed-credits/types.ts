import {
  DiscountApplicationTime,
  DiscountType,
  CreditStatus
} from '@/lib/generated/prisma/client';

export type DelayedCredit = {
  id: string;
  number: string;
  status: CreditStatus;
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

export interface DelayedCreditFormProps {
  mode: 'create' | 'edit';
  initialData?: DelayedCredit;
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

export interface DelayedCreditAction {
  id: string;
  status: CreditStatus;
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
    delayedCreditId: string;
  }[];
  customer: {
    displayName: string | null;
    primaryEmail: string | null;
  };
  attachments: {
    id: string;
    fileId: string;
    delayedCreditId: string;
  }[];
  amount: number;
}

export interface BaseDelayedCreditInput {
  customerId: string;
  status: CreditStatus;
  dueDate: Date;
  notes?: string;
  emailCustomer?: string | null;
  customerAddress: PrismaJson.Address;
  taxId?: string;
  items: DelayedCreditItemInput[];
  discountType: DiscountType | null;
  discountValue: number;
  ccEmail: string;
  discountApplicationTime: DiscountApplicationTime;
}

export interface DelayedCreditItemInput {
  id: string;
  productName: string;
  description?: string;
  quantity: number;
  rate: number;
  sku: string | null;
  taxable: boolean;
  itemId: string | null;
}

export interface UpdateDelayedCreditData extends BaseDelayedCreditInput {
  files?: FileWithPreview[];
  removedAttachmentIds?: string[];
}

export type CreateDelayedCreditResponse =
  | { success: true; data: DelayedCreditAction }
  | { success: false; error: string };

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

export interface CreateDelayedCreditData extends BaseDelayedCreditInput {
  files?: FileWithPreview[];
}

export interface DelayedCreditItem {
  id: string;
  productName: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
  taxable: boolean;
  sku: string | null;
}
