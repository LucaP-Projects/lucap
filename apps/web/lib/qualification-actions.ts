'use server';

import { revalidatePath } from 'next/cache';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type QualifiableDocumentType =
  | 'invoice'
  | 'estimate'
  | 'creditMemo'
  | 'salesReceipt'
  | 'refundReceipt'
  | 'delayedCharge'
  | 'delayedCredit';

export type QualificationData = {
  fournisseur: string;
  numeroFacture: string;
  montantHT: number;
  tauxTVA: number;
  fodec: boolean;
  droitTimbre: number;
  status: 'VALIDATED' | 'REJECTED';
};

type QualifiableDelegate = {
  findUnique: (args: {
    where: { id: string; companyId: string };
    select: { notes: true; customerId: true };
  }) => Promise<{ notes: string | null; customerId: string } | null>;
  update: (args: {
    where: { id: string; companyId: string };
    data: { notes: string };
  }) => Promise<unknown>;
};

const ROUTE_SEGMENTS: Record<QualifiableDocumentType, string> = {
  invoice: 'invoices',
  estimate: 'estimates',
  creditMemo: 'credit-memos',
  salesReceipt: 'sales-receipts',
  refundReceipt: 'refund-receipts',
  delayedCharge: 'delayed-charges',
  delayedCredit: 'delayed-credits',
};

export async function qualifyDocument(
  documentType: QualifiableDocumentType,
  documentId: string,
  data: QualificationData
): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return { success: false, error: 'Not authenticated' };

  try {
    const delegate = (
      prisma as unknown as Record<QualifiableDocumentType, QualifiableDelegate>
    )[documentType];

    const existing = await delegate.findUnique({
      where: { id: documentId, companyId: session.user.activeCompanyId },
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

    await delegate.update({
      where: { id: documentId, companyId: session.user.activeCompanyId },
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
      const segment = ROUTE_SEGMENTS[documentType];
      revalidatePath(
        `/${companySlug}/accountant-review/${segment}/${existing.customerId}`
      );
      revalidatePath(
        `/${companySlug}/accountant-review/${segment}/${existing.customerId}/${documentId}`
      );
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to qualify document' };
  }
}
