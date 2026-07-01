import { CustomerSummaryList } from '@/components/accountant-review/customer-summary-list';
import { getCustomersWithEstimateSummary } from './actions';

interface PageProps {
  params: Promise<{ 'company-slug': string }>;
}

export default async function AccountantEstimatesPage({ params }: PageProps) {
  const { 'company-slug': companySlug } = await params;
  const customers = await getCustomersWithEstimateSummary();

  return (
    <CustomerSummaryList
      title="Estimates Review"
      description="Select a customer to view their estimates"
      companySlug={companySlug}
      routeSegment="estimates"
      customers={customers}
    />
  );
}
