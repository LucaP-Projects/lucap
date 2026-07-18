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

export async function getRefundReceiptsForAccountant(): Promise<FlatAccountantDocument[]> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return [];

  const refundReceipts = await prisma.refundReceipt.findMany({
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

  return refundReceipts.map((r) => ({
    id: r.id,
    number: r.number,
    amount: r.amount,
    dueDate: r.dueDate,
    createdAt: r.createdAt,
    notes: r.notes,
    qualificationStatus: getDocumentQualificationStatus(r.notes),
    customerId: r.customer.id,
    customerName: r.customer.displayName,
  }));
}

export type RefundReceiptItemForAccountant = {
  id: string;
  productName: string;
  description: string | null;
  quantity: number;
  rate: number;
  amount: number;
};

export type RefundReceiptForAccountant = {
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
  items: RefundReceiptItemForAccountant[];
  attachments: {
    id: string;
    file: { id: string; filename: string; path: string; mimetype: string };
  }[];
};

export async function getCustomersWithRefundReceiptSummary(): Promise<CustomerDocumentSummary[]> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return [];

  const customers = await prisma.customer.findMany({
    where: {
      companyId: session.user.activeCompanyId,
      isActive: true,
      refundReceipts: { some: { isActive: true } },
    },
    select: {
      id: true,
      displayName: true,
      primaryEmail: true,
      refundReceipts: {
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
    documentCount: c.refundReceipts.length,
    pendingCount: c.refundReceipts.filter(
      (r) => !getDocumentQualificationStatus(r.notes)
    ).length,
    totalAmount: c.refundReceipts.reduce((sum, r) => sum + r.amount, 0),
  }));
}

export async function getCustomerRefundReceiptsForAccountant(customerId: string): Promise<{
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

  const refundReceipts = await prisma.refundReceipt.findMany({
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

  const documents = refundReceipts.map((r) => ({
    ...r,
    qualificationStatus: getDocumentQualificationStatus(r.notes),
  }));

  return { customer, documents };
}

export async function getRefundReceiptForAccountant(
  refundReceiptId: string,
  customerId: string
): Promise<{ refundReceipt: RefundReceiptForAccountant | null; customer: CustomerForAccountant | null }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return { refundReceipt: null, customer: null };

  const [refundReceiptData, customer] = await Promise.all([
    prisma.refundReceipt.findUnique({
      where: {
        id: refundReceiptId,
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

  if (!refundReceiptData) return { refundReceipt: null, customer };

  return {
    refundReceipt: { ...refundReceiptData, companyName: refundReceiptData.company.name },
    customer,
  };
}
