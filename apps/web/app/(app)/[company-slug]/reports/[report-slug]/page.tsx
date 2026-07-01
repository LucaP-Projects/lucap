import React from 'react';
import { notFound } from 'next/navigation';
import { ReportViewer } from '@/components/reports/report-viewer';
import { prisma } from '@/lib/prisma';

export default async function ReportDetailPage({ 
  params 
}: { 
  params: Promise<{ 'company-slug': string, 'report-slug': string }> 
}) {
  const { 'company-slug': companySlug, 'report-slug': reportSlug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug: companySlug }
  });

  if (!company) {
    notFound();
  }

  // In a real app, you would fetch the report definition and data based on reportSlug
  // For now, we'll map the slug to a display title
  const reportTitles: Record<string, string> = {
    'audit-log': 'Audit Log',
    'balance-sheet': 'Balance Sheet',
    'balance-sheet-comparison': 'Balance Sheet Comparison',
    'balance-sheet-detail': 'Balance Sheet Detail',
    'balance-sheet-summary': 'Balance Sheet Summary',
    'cash-flow': 'Statement of Cash Flows',
    'snapshot': 'Business Snapshot',
    'profit-loss': 'Profit and Loss',
    'profit-loss-customer': 'Profit and Loss by Customer',
    'ar-aging-summary': 'Accounts Receivable Aging Summary',
    'inventory-valuation-summary': 'Inventory Valuation Summary',
  };

  const title = reportTitles[reportSlug] || 'Report';

  return (
    <div className="h-screen flex flex-col">
      <ReportViewer 
        title={title} 
        companyName={company.name} 
        companySlug={companySlug}
        reportType={reportSlug}
      />
    </div>
  );
}
