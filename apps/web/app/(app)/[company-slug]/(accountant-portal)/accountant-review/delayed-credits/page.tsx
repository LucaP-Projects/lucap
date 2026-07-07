import { CustomerSummaryList } from '@/components/accountant-review/customer-summary-list';
import { getCustomersWithDelayedCreditSummary } from './actions';

interface PageProps {
  params: Promise<{ 'company-slug': string }>;
}

export default async function AccountantDelayedCreditsPage({ params }: PageProps) {
  const { 'company-slug': companySlug } = await params;
  const customers = await getCustomersWithDelayedCreditSummary();

  return (
    <CustomerSummaryList
      title="Delayed Credits Review"
      description="Select a customer to view their delayed credits"
      companySlug={companySlug}
      routeSegment="delayed-credits"
      customers={customers}
    />
  );
}
