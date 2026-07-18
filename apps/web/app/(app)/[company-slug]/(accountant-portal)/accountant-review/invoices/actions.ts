'use server';

import { revalidatePath } from 'next/cache';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@/lib/generated/prisma/enums';
import { getDocumentQualificationStatus } from '@/lib/document-qualification';
import { FlatAccountantDocument } from '@/components/accountant-review/types';

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
  qualificationStatus: 'VALIDATED' | 'REJECTED' | null;
  payments: { amount: number; paymentDate: Date }[];
};

export type CustomerForAccountant = {
  id: string;
  displayName: string;
  primaryEmail: string | null;
  companyName: string | null;
};

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
          notes: true,
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
    pendingCount: c.invoices.filter(
      (inv) => !getDocumentQualificationStatus(inv.notes)
    ).length,
    totalAmount: c.invoices.reduce((sum, inv) => sum + inv.amount, 0),
  }));
}

export async function getInvoicesForAccountant(): Promise<FlatAccountantDocument[]> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return [];

  const invoices = await prisma.invoice.findMany({
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

  return invoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    amount: inv.amount,
    dueDate: inv.dueDate,
    createdAt: inv.createdAt,
    notes: inv.notes,
    qualificationStatus: getDocumentQualificationStatus(inv.notes),
    customerId: inv.customer.id,
    customerName: inv.customer.displayName,
  }));
}

export type InvoiceItemForAccountant = {
  id: string;
  productName: string;
  description: string | null;
  quantity: number;
  rate: number;
  amount: number;
};

export type InvoiceForAccountant = {
  id: string;
  number: string;
  amount: number;
  status: PaymentStatus;
  dueDate: Date;
  createdAt: Date;
  notes: string | null;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  companyName: string;
  payments: { amount: number; paymentDate: Date }[];
  items: InvoiceItemForAccountant[];
  attachments: {
    id: string;
    file: { id: string; filename: string; path: string; mimetype: string };
  }[];
};

export type QualificationData = {
  fournisseur: string;
  numeroFacture: string;
  montantHT: number;
  tauxTVA: number;
  fodec: boolean;
  droitTimbre: number;
  status: 'VALIDATED' | 'REJECTED';
};

export async function getInvoiceForAccountant(
  invoiceId: string,
  customerId: string
): Promise<{ invoice: InvoiceForAccountant | null; customer: CustomerForAccountant | null }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return { invoice: null, customer: null };

  const [invoiceData, customer] = await Promise.all([
    prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        companyId: session.user.activeCompanyId,
        customerId,
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
        taxRate: true,
        taxAmount: true,
        discountAmount: true,
        payments: { select: { amount: true, paymentDate: true } },
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

  if (!invoiceData) return { invoice: null, customer };

  return {
    invoice: { ...invoiceData, companyName: invoiceData.company.name },
    customer,
  };
}

export async function qualifyInvoice(
  invoiceId: string,
  data: QualificationData
): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return { success: false, error: 'Not authenticated' };

  try {
    const existing = await prisma.invoice.findUnique({
      where: { id: invoiceId, companyId: session.user.activeCompanyId },
      select: { notes: true, customerId: true },
    });

    let existingData: Record<string, unknown> = {};
    if (existing?.notes) {
      try {
        existingData = JSON.parse(existing.notes);
      } catch {
        existingData = { originalNotes: existing.notes };
      }
    }

    await prisma.invoice.update({
      where: { id: invoiceId, companyId: session.user.activeCompanyId },
      data: {
        notes: JSON.stringify({
          ...existingData,
          accountantValidation: {
            ...data,
            qualifiedAt: new Date().toISOString(),
            qualifiedBy: session.user.id,
          },
        }),
      },
    });

    const companySlug = session.activeCompany?.slug;
    if (companySlug && existing?.customerId) {
      revalidatePath(
        `/${companySlug}/accountant-review/invoices/${existing.customerId}`
      );
      revalidatePath(
        `/${companySlug}/accountant-review/invoices/${existing.customerId}/${invoiceId}`
      );
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to qualify invoice' };
  }
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

  const withQualification = invoices.map((inv) => ({
    ...inv,
    qualificationStatus: getDocumentQualificationStatus(inv.notes),
  }));

  const sorted = withQualification.sort(
    (a, b) =>
      STATUS_SORT_ORDER[a.status as PaymentStatus] -
      STATUS_SORT_ORDER[b.status as PaymentStatus]
  );

  return { customer, invoices: sorted };
}
