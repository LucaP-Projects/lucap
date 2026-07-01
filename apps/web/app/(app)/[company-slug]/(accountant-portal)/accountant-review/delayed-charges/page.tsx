import { CustomerSummaryList } from '@/components/accountant-review/customer-summary-list';
import { getCustomersWithDelayedChargeSummary } from './actions';

interface PageProps {
  params: Promise<{ 'company-slug': string }>;
}

export default async function AccountantDelayedChargesPage({ params }: PageProps) {
  const { 'company-slug': companySlug } = await params;
  const customers = await getCustomersWithDelayedChargeSummary();

  return (
    <CustomerSummaryList
      title="Delayed Charges Review"
      description="Select a customer to view their delayed charges"
      companySlug={companySlug}
      routeSegment="delayed-charges"
      customers={customers}
    />
  );
}
