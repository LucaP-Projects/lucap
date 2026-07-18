import { DocumentList } from '@/components/accountant-review/document-list';
import { getPaymentsForAccountant } from './actions';

interface PageProps {
  params: Promise<{ 'company-slug': string }>;
}

export default async function AccountantPaymentsPage({ params }: PageProps) {
  const { 'company-slug': companySlug } = await params;
  const documents = await getPaymentsForAccountant();

  return (
    <DocumentList
      title="Payments Review"
      description="All payments for this company"
      companySlug={companySlug}
      routeSegment="payments"
      documents={documents}
      documentNumberLabel="Payment #"
    />
  );
}
