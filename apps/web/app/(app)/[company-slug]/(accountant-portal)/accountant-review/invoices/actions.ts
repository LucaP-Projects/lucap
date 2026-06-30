'use server';

import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@/lib/generated/prisma/enums';

export type CustomerInvoiceSummary = {
  id: string;
  displayName: string;
  primaryEmail: string | null;
  invoiceCount: number;
  pendingCount: number;
  totalAmount: number;
};

export type AccountantInvoice = {
  id: string;
  number: string;
  amount: number;
  status: PaymentStatus;
  dueDate: Date;
  createdAt: Date;
  notes: string | null;
  payments: { amount: number; paymentDate: Date }[];
};

export type CustomerForAccountant = {
  id: string;
  displayName: string;
  primaryEmail: string | null;
  companyName: string | null;
};

const PENDING_STATUSES = [PaymentStatus.OVERDUE, PaymentStatus.PENDING, PaymentStatus.PARTIAL];

const STATUS_SORT_ORDER: Record<PaymentStatus, number> = {
  [PaymentStatus.OVERDUE]: 0,
  [PaymentStatus.PENDING]: 1,
  [PaymentStatus.PARTIAL]: 2,
  [PaymentStatus.PAID]: 3,
  [PaymentStatus.CANCELLED]: 4,
};

export async function getCustomersWithInvoiceSummary(): Promise<CustomerInvoiceSummary[]> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return [];

  const customers = await prisma.customer.findMany({
    where: {
      companyId: session.user.activeCompanyId,
      isActive: true,
      invoices: { some: { isActive: true } },
    },
    select: {
      id: true,
      displayName: true,
      primaryEmail: true,
      invoices: {
        where: { isActive: true },
        select: {
          id: true,
          amount: true,
          status: true,
        },
      },
    },
    orderBy: { displayName: 'asc' },
  });

  return customers.map((c) => ({
    id: c.id,
    displayName: c.displayName,
    primaryEmail: c.primaryEmail,
    invoiceCount: c.invoices.length,
    pendingCount: c.invoices.filter((inv) =>
      PENDING_STATUSES.includes(inv.status as PaymentStatus)
    ).length,
    totalAmount: c.invoices.reduce((sum, inv) => sum + inv.amount, 0),
  }));
}

export async function getCustomerInvoicesForAccountant(customerId: string): Promise<{
  customer: CustomerForAccountant | null;
  invoices: AccountantInvoice[];
}> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return { customer: null, invoices: [] };

  const customer = await prisma.customer.findUnique({
    where: { id: customerId, companyId: session.user.activeCompanyId },
    select: {
      id: true,
      displayName: true,
      primaryEmail: true,
      companyName: true,
    },
  });

  if (!customer) return { customer: null, invoices: [] };

  const invoices = await prisma.invoice.findMany({
    where: {
      customerId,
      companyId: session.user.activeCompanyId,
      isActive: true,
    },
    select: {
      id: true,
      number: true,
      amount: true,
      status: true,
      dueDate: true,
      createdAt: true,
      notes: true,
      payments: {
        select: { amount: true, paymentDate: true },
      },
    },
    orderBy: { dueDate: 'desc' },
  });

  const sorted = [...invoices].sort(
    (a, b) =>
      STATUS_SORT_ORDER[a.status as PaymentStatus] -
      STATUS_SORT_ORDER[b.status as PaymentStatus]
  );

  return { customer, invoices: sorted };
}
