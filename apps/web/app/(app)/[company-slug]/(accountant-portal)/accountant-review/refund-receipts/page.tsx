import { DocumentList } from '@/components/accountant-review/document-list';
import { getRefundReceiptsForAccountant } from './actions';

interface PageProps {
  params: Promise<{ 'company-slug': string }>;
}

export default async function AccountantRefundReceiptsPage({ params }: PageProps) {
  const { 'company-slug': companySlug } = await params;
  const documents = await getRefundReceiptsForAccountant();

  return (
    <DocumentList
      title="Refund Receipts Review"
      description="All refund receipts for this company"
      companySlug={companySlug}
      routeSegment="refund-receipts"
      documents={documents}
      documentNumberLabel="Refund #"
    />
  );
}
