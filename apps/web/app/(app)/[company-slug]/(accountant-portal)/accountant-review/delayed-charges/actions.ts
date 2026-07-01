'use server';

import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getDocumentQualificationStatus } from '@/lib/document-qualification';
import {
  AccountantDocument,
  CustomerDocumentSummary,
  CustomerForAccountant,
} from '@/components/accountant-review/types';

export type DelayedChargeItemForAccountant = {
  id: string;
  productName: string;
  description: string | null;
  quantity: number;
  rate: number;
  amount: number;
};

export type DelayedChargeForAccountant = {
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
  items: DelayedChargeItemForAccountant[];
  attachments: {
    id: string;
    file: { id: string; filename: string; path: string; mimetype: string };
  }[];
};

export async function getCustomersWithDelayedChargeSummary(): Promise<CustomerDocumentSummary[]> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return [];

  const customers = await prisma.customer.findMany({
    where: {
      companyId: session.user.activeCompanyId,
      isActive: true,
      delayedCharges: { some: { isActive: true } },
    },
    select: {
      id: true,
      displayName: true,
      primaryEmail: true,
      delayedCharges: {
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
    documentCount: c.delayedCharges.length,
    pendingCount: c.delayedCharges.filter(
      (d) => !getDocumentQualificationStatus(d.notes)
    ).length,
    totalAmount: c.delayedCharges.reduce((sum, d) => sum + d.amount, 0),
  }));
}

export async function getCustomerDelayedChargesForAccountant(customerId: string): Promise<{
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

  const delayedCharges = await prisma.delayedCharge.findMany({
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

  const documents = delayedCharges.map((d) => ({
    ...d,
    qualificationStatus: getDocumentQualificationStatus(d.notes),
  }));

  return { customer, documents };
}

export async function getDelayedChargeForAccountant(
  delayedChargeId: string,
  customerId: string
): Promise<{ delayedCharge: DelayedChargeForAccountant | null; customer: CustomerForAccountant | null }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return { delayedCharge: null, customer: null };

  const [delayedChargeData, customer] = await Promise.all([
    prisma.delayedCharge.findUnique({
      where: {
        id: delayedChargeId,
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

  if (!delayedChargeData) return { delayedCharge: null, customer };

  return {
    delayedCharge: { ...delayedChargeData, companyName: delayedChargeData.company.name },
    customer,
  };
}
