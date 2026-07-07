import { notFound } from 'next/navigation';
import { CustomerDocumentsList } from '@/components/accountant-review/customer-documents-list';
import { getCustomerDelayedChargesForAccountant } from '../actions';

interface PageProps {
  params: Promise<{ 'company-slug': string; customerId: string }>;
}

export default async function CustomerDelayedChargesPage({ params }: PageProps) {
  const { 'company-slug': companySlug, customerId } = await params;
  const { customer, documents } = await getCustomerDelayedChargesForAccountant(customerId);

  if (!customer) notFound();

  return (
    <CustomerDocumentsList
      customer={customer}
      documents={documents}
      companySlug={companySlug}
      routeSegment="delayed-charges"
      backHref={`/${companySlug}/accountant-review/delayed-charges`}
      documentNumberLabel="Charge #"
    />
  );
}
