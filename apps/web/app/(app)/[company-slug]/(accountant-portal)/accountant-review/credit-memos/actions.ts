'use server';

import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getDocumentQualificationStatus } from '@/lib/document-qualification';
import {
  AccountantDocument,
  CustomerDocumentSummary,
  CustomerForAccountant,
  FlatAccountantDocument,
} from '@/components/accountant-review/types';

export async function getCreditMemosForAccountant(): Promise<FlatAccountantDocument[]> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return [];

  const creditMemos = await prisma.creditMemo.findMany({
    where: { companyId: session.user.activeCompanyId, isActive: true },
    select: {
      id: true,
      number: true,
      amount: true,
      dueDate: true,
      createdAt: true,
      notes: true,
      customer: { select: { id: true, displayName: true } },
    },
    orderBy: { dueDate: 'desc' },
  });

  return creditMemos.map((m) => ({
    id: m.id,
    number: m.number,
    amount: m.amount,
    dueDate: m.dueDate,
    createdAt: m.createdAt,
    notes: m.notes,
    qualificationStatus: getDocumentQualificationStatus(m.notes),
    customerId: m.customer.id,
    customerName: m.customer.displayName,
  }));
}

export type CreditMemoItemForAccountant = {
  id: string;
  productName: string;
  description: string | null;
  quantity: number;
  rate: number;
  amount: number;
};

export type CreditMemoForAccountant = {
  id: string;
  number: string;
  amount: number;
  dueDate: Date;
  createdAt: Date;
  notes: string | null;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  companyName: string;
  items: CreditMemoItemForAccountant[];
  attachments: {
    id: string;
    file: { id: string; filename: string; path: string; mimetype: string };
  }[];
};

export async function getCustomersWithCreditMemoSummary(): Promise<CustomerDocumentSummary[]> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return [];

  const customers = await prisma.customer.findMany({
    where: {
      companyId: session.user.activeCompanyId,
      isActive: true,
      creditMemos: { some: { isActive: true } },
    },
    select: {
      id: true,
      displayName: true,
      primaryEmail: true,
      creditMemos: {
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
    documentCount: c.creditMemos.length,
    pendingCount: c.creditMemos.filter(
      (m) => !getDocumentQualificationStatus(m.notes)
    ).length,
    totalAmount: c.creditMemos.reduce((sum, m) => sum + m.amount, 0),
  }));
}

export async function getCustomerCreditMemosForAccountant(customerId: string): Promise<{
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

  const creditMemos = await prisma.creditMemo.findMany({
    where: { customerId, companyId: session.user.activeCompanyId, isActive: true },
    select: {
      id: true,
      number: true,
      amount: true,
      dueDate: true,
      createdAt: true,
      notes: true,
    },
    orderBy: { dueDate: 'desc' },
  });

  const documents = creditMemos.map((m) => ({
    ...m,
    qualificationStatus: getDocumentQualificationStatus(m.notes),
  }));

  return { customer, documents };
}

export async function getCreditMemoForAccountant(
  creditMemoId: string,
  customerId: string
): Promise<{ creditMemo: CreditMemoForAccountant | null; customer: CustomerForAccountant | null }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return { creditMemo: null, customer: null };

  const [creditMemoData, customer] = await Promise.all([
    prisma.creditMemo.findUnique({
      where: {
        id: creditMemoId,
        companyId: session.user.activeCompanyId,
        customerId,
        isActive: true,
      },
      select: {
        id: true,
        number: true,
        amount: true,
        dueDate: true,
        createdAt: true,
        notes: true,
        taxRate: true,
        taxAmount: true,
        discountAmount: true,
        items: {
          where: { isActive: true },
          select: {
            id: true,
            productName: true,
            description: true,
            quantity: true,
            rate: true,
            amount: true,
          },
        },
        attachments: {
          where: { isActive: true },
          include: {
            file: {
              select: { id: true, filename: true, path: true, mimetype: true },
            },
          },
        },
        company: { select: { name: true } },
      },
    }),
    prisma.customer.findUnique({
      where: { id: customerId, companyId: session.user.activeCompanyId },
      select: { id: true, displayName: true, primaryEmail: true, companyName: true },
    }),
  ]);

  if (!creditMemoData) return { creditMemo: null, customer };

  return {
    creditMemo: { ...creditMemoData, companyName: creditMemoData.company.name },
    customer,
  };
}
