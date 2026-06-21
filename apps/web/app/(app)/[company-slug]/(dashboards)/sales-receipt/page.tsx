import { getCurrentCompany } from '@/components/base/company/actions';
import { SalesReceiptForm } from '@/components/sales-receipt/main';
export default async function InvoicePage() {
  const company = await getCurrentCompany();
  return <SalesReceiptForm mode="create" company={company} />;
}
