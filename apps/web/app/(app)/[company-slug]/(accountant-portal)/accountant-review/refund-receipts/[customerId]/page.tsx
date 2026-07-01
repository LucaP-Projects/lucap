import { notFound } from 'next/navigation';
import { CustomerDocumentsList } from '@/components/accountant-review/customer-documents-list';
import { getCustomerRefundReceiptsForAccountant } from '../actions';

interface PageProps {
  params: Promise<{ 'company-slug': string; customerId: string }>;
}

export default async function CustomerRefundReceiptsPage({ params }: PageProps) {
  const { 'company-slug': companySlug, customerId } = await params;
  const { customer, documents } = await getCustomerRefundReceiptsForAccountant(customerId);

  if (!customer) notFound();

  return (
    <CustomerDocumentsList
      customer={customer}
      documents={documents}
      companySlug={companySlug}
      routeSegment="refund-receipts"
      backHref={`/${companySlug}/accountant-review/refund-receipts`}
      documentNumberLabel="Refund #"
    />
  );
}
