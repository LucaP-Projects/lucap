import { DocumentList } from '@/components/accountant-review/document-list';
import { getDelayedCreditsForAccountant } from './actions';

interface PageProps {
  params: Promise<{ 'company-slug': string }>;
}

export default async function AccountantDelayedCreditsPage({ params }: PageProps) {
  const { 'company-slug': companySlug } = await params;
  const documents = await getDelayedCreditsForAccountant();

  return (
    <DocumentList
      title="Delayed Credits Review"
      description="All delayed credits for this company"
      companySlug={companySlug}
      routeSegment="delayed-credits"
      documents={documents}
      documentNumberLabel="Credit #"
    />
  );
}
