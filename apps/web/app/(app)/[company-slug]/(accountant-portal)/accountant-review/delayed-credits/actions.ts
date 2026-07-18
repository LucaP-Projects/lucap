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

export async function getDelayedCreditsForAccountant(): Promise<FlatAccountantDocument[]> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return [];

  const delayedCredits = await prisma.delayedCredit.findMany({
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

  return delayedCredits.map((d) => ({
    id: d.id,
    number: d.number,
    amount: d.amount,
    dueDate: d.dueDate,
    createdAt: d.createdAt,
    notes: d.notes,
    qualificationStatus: getDocumentQualificationStatus(d.notes),
    customerId: d.customer.id,
    customerName: d.customer.displayName,
  }));
}

export type DelayedCreditItemForAccountant = {
  id: string;
  productName: string;
  description: string | null;
  quantity: number;
  rate: number;
  amount: number;
};

export type DelayedCreditForAccountant = {
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
  items: DelayedCreditItemForAccountant[];
  attachments: {
    id: string;
    file: { id: string; filename: string; path: string; mimetype: string };
  }[];
};

export async function getCustomersWithDelayedCreditSummary(): Promise<CustomerDocumentSummary[]> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return [];

  const customers = await prisma.customer.findMany({
    where: {
      companyId: session.user.activeCompanyId,
      isActive: true,
      delayedCredits: { some: { isActive: true } },
    },
    select: {
      id: true,
      displayName: true,
      primaryEmail: true,
      delayedCredits: {
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
    documentCount: c.delayedCredits.length,
    pendingCount: c.delayedCredits.filter(
      (d) => !getDocumentQualificationStatus(d.notes)
    ).length,
    totalAmount: c.delayedCredits.reduce((sum, d) => sum + d.amount, 0),
  }));
}

export async function getCustomerDelayedCreditsForAccountant(customerId: string): Promise<{
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

  const delayedCredits = await prisma.delayedCredit.findMany({
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

  const documents = delayedCredits.map((d) => ({
    ...d,
    qualificationStatus: getDocumentQualificationStatus(d.notes),
  }));

  return { customer, documents };
}

export async function getDelayedCreditForAccountant(
  delayedCreditId: string,
  customerId: string
): Promise<{ delayedCredit: DelayedCreditForAccountant | null; customer: CustomerForAccountant | null }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return { delayedCredit: null, customer: null };

  const [delayedCreditData, customer] = await Promise.all([
    prisma.delayedCredit.findUnique({
      where: {
        id: delayedCreditId,
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

  if (!delayedCreditData) return { delayedCredit: null, customer };

  return {
    delayedCredit: { ...delayedCreditData, companyName: delayedCreditData.company.name },
    customer,
  };
}
