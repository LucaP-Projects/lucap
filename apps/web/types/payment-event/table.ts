import {
  CustomerPaymentEvent,
  Invoice,
  PaymentEvent,
  PaymentFrequency,
  VersionStatus
} from '@/lib/generated/prisma/client';

// Customer type matching your implementation
export type FormattedCustomer = {
  id: string;
  displayName: string;
  status: 'ACTIVE' | 'INACTIVE';
  level: number;
  subCustomers: FormattedCustomer[];
};

// Payment Version type matching your query
export type PaymentEventVersionBasic = {
  id: string;
  name: string;
  type: PaymentFrequency;
  status: VersionStatus;
  version: number;
  paymentSettings: {
    type: PaymentFrequency;
    settings: {
      amount: number;
      minPartialAmount?: number;
      generateInvoiceNow?: boolean;
      defaultDueDate?: string;
      initialFee?: {
        amount: number;
        description?: string;
      };
    };
  };
};

// CustomerPaymentEvent with invoices
export type CustomerPaymentEventWithInvoices = CustomerPaymentEvent & {
  invoices: Invoice[];
};

// Main PaymentEvent type with relations
export type PaymentEventWithRelations = PaymentEvent & {
  currentVersion: PaymentEventVersionBasic | null;
  customerPaymentEvents: CustomerPaymentEventWithInvoices[];
};

// Props types for components
export type DesktopViewProps = {
  paymentEvents: PaymentEventWithRelations[];
  customers: FormattedCustomer[];
};

export type PaymentEventRowProps = {
  event: PaymentEventWithRelations;
  customers: FormattedCustomer[];
};

// Query function types
export type GetPaymentEventsWithRelations = () => Promise<
  PaymentEventWithRelations[]
>;
export type GetActiveCustomers = () => Promise<FormattedCustomer[]>;
