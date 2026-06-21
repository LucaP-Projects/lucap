import { getCurrentCompany } from '@/components/base/company/actions';
import { InvoiceForm } from '@/components/invoice/main';

export default async function InvoicePage() {
  const company = await getCurrentCompany();
  return <InvoiceForm mode="create" company={company} />;
}
