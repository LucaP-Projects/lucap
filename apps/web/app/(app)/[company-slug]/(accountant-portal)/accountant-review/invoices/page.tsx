import { DocumentList } from '@/components/accountant-review/document-list';
import { getInvoicesForAccountant } from './actions';

interface PageProps {
  params: Promise<{ 'company-slug': string }>;
}

export default async function AccountantInvoicesPage({ params }: PageProps) {
  const { 'company-slug': companySlug } = await params;
  const documents = await getInvoicesForAccountant();

  return (
    <DocumentList
      title="Invoices Review"
      description="All invoices for this company"
      companySlug={companySlug}
      routeSegment="invoices"
      documents={documents}
      documentNumberLabel="Invoice #"
    />
  );
}
