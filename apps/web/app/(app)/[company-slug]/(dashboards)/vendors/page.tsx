import { getVendorsPage, getVendorStats } from '@/components/dashboard/vendors/actions';
import VendorsPage from '@/components/dashboard/vendors/main';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = typeof params.search === 'string' ? params.search : undefined;

  return (
    <VendorsPage
      initialData={await getVendorsPage(page, 10, { search })}
      initialStats={await getVendorStats()}
      searchParams={params}
    />
  );
}
