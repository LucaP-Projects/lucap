import { PaymentMethod, PaymentStatus } from '@/lib/generated/prisma/client';
export type InvoiceBasic = {
  id: string;
  number: string;
  customer: {
    displayName: string | null;
    primaryEmail: string | null;
  };
  items: {
    id: string;
    amount: number;
    createdAt: Date;
    updatedAt: Date;
    productName: string;
    description: string | null;
    quantity: number;
    rate: number;
    taxable: boolean;
    itemId: string | null;
    invoiceId: string;
  }[];
  payments: {
    amount: number;
    paymentDate: Date;
    paymentMethod: PaymentMethod;
  }[];
  estimate: {
    id: string;
    number: string;
  } | null;
  status: PaymentStatus;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
};
export type StatsType = {
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  outstandingAmount: number;
  statusBreakdown: Record<PaymentStatus, { count: number; amount: number }>;
  estimateConversions: {
    count: number;
    rate: number;
  };
};

export type InvoiceResponse = {
  data: InvoiceBasic[];
  metadata: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
};

export type ServerResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  redirect?: string;
};

export type InvoiceMetadata = {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};
