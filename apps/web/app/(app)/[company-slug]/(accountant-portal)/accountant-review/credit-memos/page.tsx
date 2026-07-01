import { CustomerSummaryList } from '@/components/accountant-review/customer-summary-list';
import { getCustomersWithCreditMemoSummary } from './actions';

interface PageProps {
  params: Promise<{ 'company-slug': string }>;
}

export default async function AccountantCreditMemosPage({ params }: PageProps) {
  const { 'company-slug': companySlug } = await params;
  const customers = await getCustomersWithCreditMemoSummary();

  return (
    <CustomerSummaryList
      title="Credit Memos Review"
      description="Select a customer to view their credit memos"
      companySlug={companySlug}
      routeSegment="credit-memos"
      customers={customers}
    />
  );
}
