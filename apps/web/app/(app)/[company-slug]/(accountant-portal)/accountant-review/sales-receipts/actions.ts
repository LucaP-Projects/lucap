'use server';

import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getDocumentQualificationStatus } from '@/lib/document-qualification';
import {
  AccountantDocument,
  CustomerDocumentSummary,
  CustomerForAccountant,
} from '@/components/accountant-review/types';

export type SalesReceiptItemForAccountant = {
  id: string;
  productName: string;
  description: string | null;
  quantity: number;
  rate: number;
  amount: number;
};

export type SalesReceiptForAccountant = {
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
  items: SalesReceiptItemForAccountant[];
  attachments: {
    id: string;
    file: { id: string; filename: string; path: string; mimetype: string };
  }[];
};

export async function getCustomersWithSalesReceiptSummary(): Promise<CustomerDocumentSummary[]> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return [];

  const customers = await prisma.customer.findMany({
    where: {
      companyId: session.user.activeCompanyId,
      isActive: true,
      salesReceipts: { some: { isActive: true } },
    },
    select: {
      id: true,
      displayName: true,
      primaryEmail: true,
      salesReceipts: {
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
    documentCount: c.salesReceipts.length,
    pendingCount: c.salesReceipts.filter(
      (r) => !getDocumentQualificationStatus(r.notes)
    ).length,
    totalAmount: c.salesReceipts.reduce((sum, r) => sum + r.amount, 0),
  }));
}

export async function getCustomerSalesReceiptsForAccountant(customerId: string): Promise<{
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

  const salesReceipts = await prisma.salesReceipt.findMany({
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

  const documents = salesReceipts.map((r) => ({
    ...r,
    qualificationStatus: getDocumentQualificationStatus(r.notes),
  }));

  return { customer, documents };
}

export async function getSalesReceiptForAccountant(
  salesReceiptId: string,
  customerId: string
): Promise<{ salesReceipt: SalesReceiptForAccountant | null; customer: CustomerForAccountant | null }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return { salesReceipt: null, customer: null };

  const [salesReceiptData, customer] = await Promise.all([
    prisma.salesReceipt.findUnique({
      where: {
        id: salesReceiptId,
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

  if (!salesReceiptData) return { salesReceipt: null, customer };

  return {
    salesReceipt: { ...salesReceiptData, companyName: salesReceiptData.company.name },
    customer,
  };
}
