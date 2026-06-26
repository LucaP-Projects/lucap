import {
  PaymentStatus,
  Invoice,
  Customer,
  PaymentEvent,
  PaymentEventVersion,
  User,
  CustomerPaymentEvent
} from '@/lib/generated/prisma/browser';

export type InvoiceWithRelations = Invoice & {
  customer:
    | (Customer & {
        user: User;
      })
    | null;
  parentCustomer: Customer | null;
  customerPaymentEvent:
    | (CustomerPaymentEvent & {
        paymentEvent:
          | (PaymentEvent & {
              currentVersion: PaymentEventVersion | null;
            })
          | null;
      })
    | null;
};
export type InvoiceCreateData = {
  customerId: string;
  subCustomerId?: string;
  paymentEventId: string;
  amount: number;
  dueDate: Date;
  notes?: string;
};

export type InvoiceUpdateData = {
  status?: PaymentStatus;
  notes?: string;
};
