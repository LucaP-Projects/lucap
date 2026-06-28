import { getCurrentCompanyForInvoice } from '@/components/base/company/actions';
import { InvoiceForm } from '@/components/invoice/main';

export default async function InvoicePage() {
  const company = await getCurrentCompanyForInvoice();
  return <InvoiceForm mode="create" company={company} />;
}
