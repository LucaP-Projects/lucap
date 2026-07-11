'use server';

import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * TVA Declaration (CA3) export — Tunisian monthly VAT return.
 * Generates a structured CSV compatible with the Assujetti portal.
 * 
 * Lines:
 *   01-06: TVA collectée (collected) by rate
 *   07: TVA déductible (deductible) on purchases
 *   08: TVA déductible on fixed assets
 *   09: Crédit de TVA (carry-forward)
 *   10: TVA due (net payable)
 */
export async function generateCA3(year: number, month: number) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error('Unauthorized');
  const companyId = session.user.activeCompanyId;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true, taxId: true, matriculeFiscal: true },
  });

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Sales invoices (TVA collectée)
  const salesInvoices = await prisma.invoice.findMany({
    where: { companyId, createdAt: { gte: startDate, lte: endDate }, isActive: true },
    include: { tax: true, items: true },
  });

  // Purchase bills (TVA déductible)
  const purchaseBills = await prisma.bill.findMany({
    where: { companyId, createdAt: { gte: startDate, lte: endDate }, isActive: true },
    include: { lineItems: true },
  });

  // Calculate TVA collectée by rate
  const collectedByRate = new Map<number, number>();
  let totalCollected = 0;

  for (const inv of salesInvoices) {
    const rate = inv.tax?.rate || 0;
    const taxable = inv.items.reduce((s, i) => s + i.amount, 0);
    const tva = rate > 0 ? (taxable * rate) / 100 : 0;
    collectedByRate.set(rate, (collectedByRate.get(rate) || 0) + tva);
    totalCollected += tva;
  }

  // Calculate TVA déductible
  let totalDeductible = 0;
  for (const bill of purchaseBills) {
    const billTva = bill.taxAmount || 0;
    totalDeductible += billTva;
  }

  const tvaDue = Math.max(0, totalCollected - totalDeductible);
  const creditReport = Math.max(0, totalDeductible - totalCollected);

  // Build CSV in CA3 format
  const lines: string[] = [];
  lines.push('CA3 - Déclaration Mensuelle de TVA');
  lines.push(`Société: ${company?.name || ''}`);
  lines.push(`Matricule Fiscal: ${company?.matriculeFiscal || company?.taxId || ''}`);
  lines.push(`Période: ${month.toString().padStart(2, '0')}/${year}`);
  lines.push('');

  // Line items
  const rates = Array.from(collectedByRate.keys()).sort((a, b) => b - a);
  let lineNum = 1;
  for (const rate of rates) {
    const amount = collectedByRate.get(rate) || 0;
    const label = rate > 0 ? `TVA collectée ${rate}%` : 'Exonéré';
    lines.push(`${lineNum.toString().padStart(2, '0')};${label};${amount.toFixed(3)}`);
    lineNum++;
  }

  lines.push(`07;TVA déductible sur achats;${totalDeductible.toFixed(3)}`);
  lines.push(`08;TVA déductible sur immobilisations;0.000`);
  lines.push(`09;Crédit de TVA antérieur;0.000`);
  lines.push(`10;TVA due;${tvaDue.toFixed(3)}`);

  lines.push('');
  lines.push(`Total TVA collectée: ${totalCollected.toFixed(3)}`);
  lines.push(`Total TVA déductible: ${totalDeductible.toFixed(3)}`);
  lines.push(`TVA à payer: ${tvaDue.toFixed(3)}`);
  if (creditReport > 0) lines.push(`Crédit de TVA reportable: ${creditReport.toFixed(3)}`);

  return lines.join('\n');
}

// Download helpers are in lib/csv-export.ts for client components
