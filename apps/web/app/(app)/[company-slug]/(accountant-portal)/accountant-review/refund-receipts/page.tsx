import { CustomerSummaryList } from '@/components/accountant-review/customer-summary-list';
import { getCustomersWithRefundReceiptSummary } from './actions';

interface PageProps {
  params: Promise<{ 'company-slug': string }>;
}

export default async function AccountantRefundReceiptsPage({ params }: PageProps) {
  const { 'company-slug': companySlug } = await params;
  const customers = await getCustomersWithRefundReceiptSummary();

  return (
    <CustomerSummaryList
      title="Refund Receipts Review"
      description="Select a customer to view their refund receipts"
      companySlug={companySlug}
      routeSegment="refund-receipts"
      customers={customers}
    />
  );
}
