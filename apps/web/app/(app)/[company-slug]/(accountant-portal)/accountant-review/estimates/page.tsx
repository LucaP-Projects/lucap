import { DocumentList } from '@/components/accountant-review/document-list';
import { getEstimatesForAccountant } from './actions';

interface PageProps {
  params: Promise<{ 'company-slug': string }>;
}

export default async function AccountantEstimatesPage({ params }: PageProps) {
  const { 'company-slug': companySlug } = await params;
  const documents = await getEstimatesForAccountant();

  return (
    <DocumentList
      title="Estimates Review"
      description="All estimates for this company"
      companySlug={companySlug}
      routeSegment="estimates"
      documents={documents}
      documentNumberLabel="Estimate #"
    />
  );
}
