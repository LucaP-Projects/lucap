import { CustomerTable } from '@/components/customer/customer-table';
import { getCustomers } from './actions';
import { UIObserver } from '@/components/shared/ui-observer';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const offset = Number(params.offset) || 0;
  const search = params.search as string;
  const { customers, total, statistics } = await getCustomers({
    offset,
    search
  });
  return (
    <>
      <UIObserver 
        title="Customers List" 
        data={{ totalCustomers: total, stats: statistics }} 
      />
      <CustomerTable
        customers={customers}
        offset={offset + 10}
        totalCustomers={total}
        statistics={statistics}
      />
    </>
  );
}
