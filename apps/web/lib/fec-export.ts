'use server';

import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * FEC (Fichier des Écritures Comptables) export — Tunisian tax authority format.
 * Required for tax inspections under Code des Impôts Directs, Art. 54.
 * 
 * Generates an XML file with all journal entries for a given date range.
 */
export async function generateFEC(startDate: Date, endDate: Date) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error('Unauthorized');
  const companyId = session.user.activeCompanyId;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true, taxId: true, countryCode: true },
  });

  const journals = await prisma.journalEntry.findMany({
    where: { companyId, date: { gte: startDate, lte: endDate }, isActive: true },
    include: {
      entries: {
        where: { isActive: true },
        include: { account: { select: { number: true, title: true } } },
      },
    },
    orderBy: [{ date: 'asc' }, { journalNo: 'asc' }],
  });

  // Build FEC XML structure
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += `<FEC xmlns="http://www.impots.tn/fec" version="1.0">\n`;
  xml += `  <Entete>\n`;
  xml += `    <Societe>${escapeXml(company?.name || '')}</Societe>\n`;
  xml += `    <MatriculeFiscal>${escapeXml(company?.taxId || '')}</MatriculeFiscal>\n`;
  xml += `    <DateDebut>${formatDate(startDate)}</DateDebut>\n`;
  xml += `    <DateFin>${formatDate(endDate)}</DateFin>\n`;
  xml += `  </Entete>\n`;
  xml += `  <Ecritures>\n`;

  for (const journal of journals) {
    for (const entry of journal.entries) {
      xml += `    <Ecriture>\n`;
      xml += `      <JournalCode>${escapeXml(journal.transactionType)}</JournalCode>\n`;
      xml += `      <JournalLib>${escapeXml(journal.transactionType)}</JournalLib>\n`;
      xml += `      <EcritureNum>${escapeXml(journal.journalNo || '')}</EcritureNum>\n`;
      xml += `      <EcritureDate>${formatDate(journal.date)}</EcritureDate>\n`;
      xml += `      <CompteNum>${escapeXml(entry.account.number)}</CompteNum>\n`;
      xml += `      <CompteLib>${escapeXml(entry.account.title)}</CompteLib>\n`;
      xml += `      <Debit>${entry.debit?.toFixed(3) || '0.000'}</Debit>\n`;
      xml += `      <Credit>${entry.credit?.toFixed(3) || '0.000'}</Credit>\n`;
      xml += `      <EcritureLib>${escapeXml(entry.description || journal.description || '')}</EcritureLib>\n`;
      xml += `      <DateSaisie>${formatDate(journal.createdAt)}</DateSaisie>\n`;
      xml += `    </Ecriture>\n`;
    }
  }

  xml += `  </Ecritures>\n`;
  xml += `</FEC>\n`;

  return xml;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function formatDate(d: Date): string {
  const s = d.toISOString();
  return s.split('T')[0] ?? s;
}

// download helpers are in lib/csv-export.ts for client components
