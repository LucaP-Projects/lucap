import { CustomerSummaryList } from '@/components/accountant-review/customer-summary-list';
import { getCustomersWithSalesReceiptSummary } from './actions';

interface PageProps {
  params: Promise<{ 'company-slug': string }>;
}

export default async function AccountantSalesReceiptsPage({ params }: PageProps) {
  const { 'company-slug': companySlug } = await params;
  const customers = await getCustomersWithSalesReceiptSummary();

  return (
    <CustomerSummaryList
      title="Sales Receipts Review"
      description="Select a customer to view their sales receipts"
      companySlug={companySlug}
      routeSegment="sales-receipts"
      customers={customers}
    />
  );
}
