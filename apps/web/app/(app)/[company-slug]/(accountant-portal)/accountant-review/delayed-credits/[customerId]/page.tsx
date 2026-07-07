import { notFound } from 'next/navigation';
import { CustomerDocumentsList } from '@/components/accountant-review/customer-documents-list';
import { getCustomerDelayedCreditsForAccountant } from '../actions';

interface PageProps {
  params: Promise<{ 'company-slug': string; customerId: string }>;
}

export default async function CustomerDelayedCreditsPage({ params }: PageProps) {
  const { 'company-slug': companySlug, customerId } = await params;
  const { customer, documents } = await getCustomerDelayedCreditsForAccountant(customerId);

  if (!customer) notFound();

  return (
    <CustomerDocumentsList
      customer={customer}
      documents={documents}
      companySlug={companySlug}
      routeSegment="delayed-credits"
      backHref={`/${companySlug}/accountant-review/delayed-credits`}
      documentNumberLabel="Credit #"
    />
  );
}
