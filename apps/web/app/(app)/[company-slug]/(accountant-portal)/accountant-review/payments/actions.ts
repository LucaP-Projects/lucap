'use server';

import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getDocumentQualificationStatus } from '@/lib/document-qualification';
import {
  AccountantDocument,
  CustomerDocumentSummary,
  CustomerForAccountant,
} from '@/components/accountant-review/types';

const toPaymentNumber = (payment: { id: string; reference: string | null }) =>
  payment.reference || `PMT-${payment.id.slice(-8).toUpperCase()}`;

export type PaymentForAccountant = {
  id: string;
  number: string;
  amount: number;
  paymentDate: Date;
  createdAt: Date;
  notes: string | null;
  paymentMethod: string;
  companyName: string;
  invoiceNumber: string;
};

export async function getCustomersWithPaymentSummary(): Promise<CustomerDocumentSummary[]> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return [];

  const customers = await prisma.customer.findMany({
    where: {
      companyId: session.user.activeCompanyId,
      isActive: true,
      payments: { some: { isActive: true } },
    },
    select: {
      id: true,
      displayName: true,
      primaryEmail: true,
      payments: {
        where: { isActive: true },
        select: { id: true, amount: true, notes: true },
      },
    },
    orderBy: { displayName: 'asc' },
  });

  return customers.map((c) => ({
    id: c.id,
    displayName: c.displayName,
    primaryEmail: c.primaryEmail,
    documentCount: c.payments.length,
    pendingCount: c.payments.filter(
      (p) => !getDocumentQualificationStatus(p.notes)
    ).length,
    totalAmount: c.payments.reduce((sum, p) => sum + p.amount, 0),
  }));
}

export async function getCustomerPaymentsForAccountant(customerId: string): Promise<{
  customer: CustomerForAccountant | null;
  documents: AccountantDocument[];
}> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return { customer: null, documents: [] };

  const customer = await prisma.customer.findUnique({
    where: { id: customerId, companyId: session.user.activeCompanyId },
    select: { id: true, displayName: true, primaryEmail: true, companyName: true },
  });

  if (!customer) return { customer: null, documents: [] };

  const payments = await prisma.payment.findMany({
    where: { customerId, companyId: session.user.activeCompanyId, isActive: true },
    select: {
      id: true,
      reference: true,
      amount: true,
      paymentDate: true,
      createdAt: true,
      notes: true,
    },
    orderBy: { paymentDate: 'desc' },
  });

  const documents = payments.map((p) => ({
    id: p.id,
    number: toPaymentNumber(p),
    amount: p.amount,
    dueDate: p.paymentDate,
    createdAt: p.createdAt,
    notes: p.notes,
    qualificationStatus: getDocumentQualificationStatus(p.notes),
  }));

  return { customer, documents };
}

export async function getPaymentForAccountant(
  paymentId: string,
  customerId: string
): Promise<{ payment: PaymentForAccountant | null; customer: CustomerForAccountant | null }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return { payment: null, customer: null };

  const [paymentData, customer] = await Promise.all([
    prisma.payment.findUnique({
      where: {
        id: paymentId,
        companyId: session.user.activeCompanyId,
        customerId,
        isActive: true,
      },
      select: {
        id: true,
        reference: true,
        amount: true,
        paymentDate: true,
        createdAt: true,
        notes: true,
        paymentMethod: true,
        company: { select: { name: true } },
        invoice: { select: { number: true } },
      },
    }),
    prisma.customer.findUnique({
      where: { id: customerId, companyId: session.user.activeCompanyId },
      select: { id: true, displayName: true, primaryEmail: true, companyName: true },
    }),
  ]);

  if (!paymentData) return { payment: null, customer };

  return {
    payment: {
      id: paymentData.id,
      number: toPaymentNumber(paymentData),
      amount: paymentData.amount,
      paymentDate: paymentData.paymentDate,
      createdAt: paymentData.createdAt,
      notes: paymentData.notes,
      paymentMethod: paymentData.paymentMethod,
      companyName: paymentData.company.name,
      invoiceNumber: paymentData.invoice?.number ?? '',
    },
    customer,
  };
}
