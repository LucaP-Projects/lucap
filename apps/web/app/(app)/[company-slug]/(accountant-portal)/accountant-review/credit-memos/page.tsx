import { DocumentList } from '@/components/accountant-review/document-list';
import { getCreditMemosForAccountant } from './actions';

interface PageProps {
  params: Promise<{ 'company-slug': string }>;
}

export default async function AccountantCreditMemosPage({ params }: PageProps) {
  const { 'company-slug': companySlug } = await params;
  const documents = await getCreditMemosForAccountant();

  return (
    <DocumentList
      title="Credit Memos Review"
      description="All credit memos for this company"
      companySlug={companySlug}
      routeSegment="credit-memos"
      documents={documents}
      documentNumberLabel="Credit Memo #"
    />
  );
}
