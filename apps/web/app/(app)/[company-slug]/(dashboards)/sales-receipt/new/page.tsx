import { getCurrentCompanyForInvoice } from '@/components/base/company/actions';
import { SalesReceiptForm } from '@/components/sales-receipt/main';

export default async function NewSalesReceiptPage() {
  const company = await getCurrentCompanyForInvoice();
  return <SalesReceiptForm mode="create" company={company} />;
}
