import { DocumentList } from '@/components/accountant-review/document-list';
import { getDelayedChargesForAccountant } from './actions';

interface PageProps {
  params: Promise<{ 'company-slug': string }>;
}

export default async function AccountantDelayedChargesPage({ params }: PageProps) {
  const { 'company-slug': companySlug } = await params;
  const documents = await getDelayedChargesForAccountant();

  return (
    <DocumentList
      title="Delayed Charges Review"
      description="All delayed charges for this company"
      companySlug={companySlug}
      routeSegment="delayed-charges"
      documents={documents}
      documentNumberLabel="Charge #"
    />
  );
}
