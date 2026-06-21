import { getCurrentCompany } from '@/components/base/company/actions';
import { RefundReceiptForm } from '@/components/refund-receipt/main';

export default async function RefundReceiptPage() {
  const company = await getCurrentCompany();
  return <RefundReceiptForm mode="create" company={company} />;
}
