import type { z } from 'zod';
import { Customer, PaymentStatus, User } from '@/lib/generated/prisma/browser';
import * as Prisma from '@/lib/generated/prisma/internal/prismaNamespace';
import { CustomerSchema } from '@/validation/customer/customer.schema';

export interface CustomerWithDetails extends Customer {
  user: Pick<User, 'id' | 'name' | 'email' | 'createdAt'>;
  subCustomersCount: number;
  paymentStatus: PaymentStatus;
}
export type CustomerListDTO = {
  customers: CustomerListItemDTO[];
  total: number;
  statistics: CustomerStatistics;
};

export type CustomerShortListDTO = {
  customers: CustomerShortListItem[];
};

export type CustomerShortListItem = Pick<
  Customer,
  'id' | 'displayName' | 'parentId' | 'level'
> & {
  parentName?: string;
};

type CustomerItem = Pick<
  Customer,
  | 'id'
  | 'displayName'
  | 'companyName'
  | 'billingAddress'
  | 'primaryPhone'
  | 'mobile'
  | 'primaryEmail'
  | 'parentId'
  | 'level'
  | 'status'
> & { customerType?: string };

export type CustomerListItemDTO = CustomerItem & {
  balance: number;
  attachments: { id: string; name: string }[];
  openEstimates: { estimateId: string }[];
  estimateAmount: number;
  unbilliedActivities: { id: string }[];
  unbilliedAmount: number;
  pendingInvoices: { id: string }[];
  subCustomersCount: number;
};
type CustomerDTO = Omit<
  Prisma.CustomerUncheckedCreateInput,
  | 'id'
  | 'parentId'
  | 'subCustomers'
  | 'invoices'
  | 'payments'
  | 'createdAt'
  | 'updatedAt'
>;
export type CreateCustomerDTO = CustomerDTO & {
  subCustomers?: CustomerDTO[];
  parentId?: string;
};

export type CustomerFormData = z.infer<typeof CustomerSchema>;

export type CustomerUpdateInput = Prisma.CustomerUpdateInput;

export type Address = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export enum CustomerFilterType {
  ALL = 'ALL',
  ESTIMATES = 'ESTIMATES',
  UNBILLED_INCOME = 'UNBILLED_INCOME',
  OVERDUE_INVOICES = 'OVERDUE_INVOICES',
  OPEN_INVOICES = 'OPEN_INVOICES',
  RECENTLY_PAID = 'RECENTLY_PAID'
}
export interface CustomerStatistics {
  estimates: { amount: number; count: number };
  unbilledAmount: number;
  overdueInvoices: { amount: number; count: number };
  openInvoices: { amount: number; count: number };
  recentlyPaid: { amount: number; count: number };
}
