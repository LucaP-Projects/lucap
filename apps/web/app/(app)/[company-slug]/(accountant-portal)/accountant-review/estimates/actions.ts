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

export async function getEstimatesForAccountant(): Promise<FlatAccountantDocument[]> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return [];

  const estimates = await prisma.estimate.findMany({
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

  return estimates.map((e) => ({
    id: e.id,
    number: e.number,
    amount: e.amount,
    dueDate: e.dueDate,
    createdAt: e.createdAt,
    notes: e.notes,
    qualificationStatus: getDocumentQualificationStatus(e.notes),
    customerId: e.customer.id,
    customerName: e.customer.displayName,
  }));
}

export type EstimateItemForAccountant = {
  id: string;
  productName: string;
  description: string | null;
  quantity: number;
  rate: number;
  amount: number;
};

export type EstimateForAccountant = {
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
  items: EstimateItemForAccountant[];
  attachments: {
    id: string;
    file: { id: string; filename: string; path: string; mimetype: string };
  }[];
};

export async function getCustomersWithEstimateSummary(): Promise<CustomerDocumentSummary[]> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return [];

  const customers = await prisma.customer.findMany({
    where: {
      companyId: session.user.activeCompanyId,
      isActive: true,
      estimates: { some: { isActive: true } },
    },
    select: {
      id: true,
      displayName: true,
      primaryEmail: true,
      estimates: {
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
    documentCount: c.estimates.length,
    pendingCount: c.estimates.filter(
      (e) => !getDocumentQualificationStatus(e.notes)
    ).length,
    totalAmount: c.estimates.reduce((sum, e) => sum + e.amount, 0),
  }));
}

export async function getCustomerEstimatesForAccountant(customerId: string): Promise<{
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

  const estimates = await prisma.estimate.findMany({
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

  const documents = estimates.map((e) => ({
    ...e,
    qualificationStatus: getDocumentQualificationStatus(e.notes),
  }));

  return { customer, documents };
}

export async function getEstimateForAccountant(
  estimateId: string,
  customerId: string
): Promise<{ estimate: EstimateForAccountant | null; customer: CustomerForAccountant | null }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return { estimate: null, customer: null };

  const [estimateData, customer] = await Promise.all([
    prisma.estimate.findUnique({
      where: {
        id: estimateId,
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

  if (!estimateData) return { estimate: null, customer };

  return {
    estimate: { ...estimateData, companyName: estimateData.company.name },
    customer,
  };
}
