import {
  DiscountApplicationTime,
  DiscountType,
  EstimateStatus
} from '@/lib/generated/prisma/client';

export type Estimate = {
  id: string;
  number: string;
  status: EstimateStatus;
  validUntil: Date | null;
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

export interface EstimateFormProps {
  mode: 'create' | 'edit';
  initialData?: Estimate;
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

export interface EstimateAction {
  id: string;
  status: EstimateStatus;
  validUntil: Date | null;
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
    estimateId: string;
  }[];
  customer: {
    displayName: string | null;
    primaryEmail: string | null;
  };
  attachments: {
    id: string;
    fileId: string;
    estimateId: string;
  }[];
  amount: number;
}

export interface BaseEstimateInput {
  customerId: string;
  status: EstimateStatus;
  validUntil?: Date;
  dueDate: Date;
  notes?: string;
  emailCustomer?: string | null;
  customerAddress: PrismaJson.Address;
  taxId?: string;
  items: EstimateItemInput[];
  discountType: DiscountType | null;
  discountValue: number;
  ccEmail: string;
  discountApplicationTime: DiscountApplicationTime;
}

export interface EstimateItemInput {
  id: string;
  productName: string;
  description?: string;
  quantity: number;
  rate: number;
  sku: string | null;
  taxable: boolean;
  itemId: string | null;
}

export interface UpdateEstimateData extends BaseEstimateInput {
  files?: FileWithPreview[];
  removedAttachmentIds?: string[];
}

export type CreateEstimateResponse =
  | { success: true; data: EstimateAction }
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

export interface CreateEstimateData extends BaseEstimateInput {
  files?: FileWithPreview[];
}

export interface EstimateItem {
  id: string;
  productName: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
  taxable: boolean;
  sku: string | null;
}
