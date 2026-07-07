import { notFound } from 'next/navigation';
import { CustomerDocumentsList } from '@/components/accountant-review/customer-documents-list';
import { getCustomerCreditMemosForAccountant } from '../actions';

interface PageProps {
  params: Promise<{ 'company-slug': string; customerId: string }>;
}

export default async function CustomerCreditMemosPage({ params }: PageProps) {
  const { 'company-slug': companySlug, customerId } = await params;
  const { customer, documents } = await getCustomerCreditMemosForAccountant(customerId);

  if (!customer) notFound();

  return (
    <CustomerDocumentsList
      customer={customer}
      documents={documents}
      companySlug={companySlug}
      routeSegment="credit-memos"
      backHref={`/${companySlug}/accountant-review/credit-memos`}
      documentNumberLabel="Credit Memo #"
    />
  );
}
