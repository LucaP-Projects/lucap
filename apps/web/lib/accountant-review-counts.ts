import { prisma } from '@/lib/prisma';
import { getDocumentQualificationStatus } from '@/lib/document-qualification';

export type PendingDocumentCounts = {
  invoices: number;
  payments: number;
  estimates: number;
  creditMemos: number;
  salesReceipts: number;
  delayedCharges: number;
  delayedCredits: number;
  refundReceipts: number;
  total: number;
};

function countPending(rows: { notes: string | null }[]) {
  return rows.filter((r) => getDocumentQualificationStatus(r.notes) === null).length;
}

export async function getPendingDocumentCounts(companyId: string): Promise<PendingDocumentCounts> {
  const [invoices, payments, estimates, creditMemos, salesReceipts, delayedCharges, delayedCredits, refundReceipts] =
    await Promise.all([
      prisma.invoice.findMany({ where: { companyId }, select: { notes: true } }),
      prisma.payment.findMany({ where: { companyId }, select: { notes: true } }),
      prisma.estimate.findMany({ where: { companyId }, select: { notes: true } }),
      prisma.creditMemo.findMany({ where: { companyId }, select: { notes: true } }),
      prisma.salesReceipt.findMany({ where: { companyId }, select: { notes: true } }),
      prisma.delayedCharge.findMany({ where: { companyId }, select: { notes: true } }),
      prisma.delayedCredit.findMany({ where: { companyId }, select: { notes: true } }),
      prisma.refundReceipt.findMany({ where: { companyId }, select: { notes: true } })
    ]);

  const counts = {
    invoices: countPending(invoices),
    payments: countPending(payments),
    estimates: countPending(estimates),
    creditMemos: countPending(creditMemos),
    salesReceipts: countPending(salesReceipts),
    delayedCharges: countPending(delayedCharges),
    delayedCredits: countPending(delayedCredits),
    refundReceipts: countPending(refundReceipts)
  };

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return { ...counts, total };
}
