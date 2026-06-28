import { getInvoices } from '@/components/invoice/actions';
import { InvoiceTable } from '@/components/invoice/invoice-table';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function InvoicesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const offset = Number(params.offset) || 0;
  const search = params.search;
  const { invoices, total } = await getInvoices({ offset, search });
  return <InvoiceTable invoices={invoices} offset={offset} total={total} />;
}
