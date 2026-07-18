import { DocumentList } from '@/components/accountant-review/document-list';
import { getSalesReceiptsForAccountant } from './actions';

interface PageProps {
  params: Promise<{ 'company-slug': string }>;
}

export default async function AccountantSalesReceiptsPage({ params }: PageProps) {
  const { 'company-slug': companySlug } = await params;
  const documents = await getSalesReceiptsForAccountant();

  return (
    <DocumentList
      title="Sales Receipts Review"
      description="All sales receipts for this company"
      companySlug={companySlug}
      routeSegment="sales-receipts"
      documents={documents}
      documentNumberLabel="Sales Receipt #"
    />
  );
}
