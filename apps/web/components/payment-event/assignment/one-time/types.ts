import { PaymentEvent } from '@/lib/generated/prisma/client';
import {
  CustomerPaymentEventWithInvoices,
  PaymentEventVersionBasic
} from '@/types/payment-event/table';

export type ActionResult = {
  success?: boolean;
  error?: string;
};

export type PaymentEventWithRelations = PaymentEvent & {
  currentVersion: PaymentEventVersionBasic | null;
  customerPaymentEvents: CustomerPaymentEventWithInvoices[];
};

export type AssignmentError = {
  code:
    | 'PAYMENT_EVENT_NOT_FOUND'
    | 'INVALID_VERSION'
    | 'INVALID_SETTINGS'
    | 'CUSTOMER_NOT_FOUND'
    | 'INVOICE_CREATION_FAILED'
    | 'DATABASE_ERROR'
    | 'INVALID_AMOUNT'
    | 'INVALID_DUE_DATE'
    | 'PRICE_VALIDATION_FAILED';
  message: string;
  details?: unknown;
};

export type AssignmentResult = {
  success: boolean;
  data?: {
    customerPaymentEvent: any;
    progress: PrismaJson.OneTimeProgress;
    invoiceCreated: boolean;
  };
  error?: AssignmentError;
};

export type AssignOneTimePaymentInput = {
  paymentEventId: string;
  customerId: string;
  amount: number;
  reason?: string;
};
