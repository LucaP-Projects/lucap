import { CustomerSummaryList } from '@/components/accountant-review/customer-summary-list';
import { getCustomersWithPaymentSummary } from './actions';

interface PageProps {
  params: Promise<{ 'company-slug': string }>;
}

export default async function AccountantPaymentsPage({ params }: PageProps) {
  const { 'company-slug': companySlug } = await params;
  const customers = await getCustomersWithPaymentSummary();

  return (
    <CustomerSummaryList
      title="Payments Review"
      description="Select a customer to view their payments"
      companySlug={companySlug}
      routeSegment="payments"
      customers={customers}
    />
  );
}
