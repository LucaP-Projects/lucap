import { notFound } from 'next/navigation';
import { CustomerDocumentsList } from '@/components/accountant-review/customer-documents-list';
import { getCustomerSalesReceiptsForAccountant } from '../actions';

interface PageProps {
  params: Promise<{ 'company-slug': string; customerId: string }>;
}

export default async function CustomerSalesReceiptsPage({ params }: PageProps) {
  const { 'company-slug': companySlug, customerId } = await params;
  const { customer, documents } = await getCustomerSalesReceiptsForAccountant(customerId);

  if (!customer) notFound();

  return (
    <CustomerDocumentsList
      customer={customer}
      documents={documents}
      companySlug={companySlug}
      routeSegment="sales-receipts"
      backHref={`/${companySlug}/accountant-review/sales-receipts`}
      documentNumberLabel="Receipt #"
    />
  );
}
