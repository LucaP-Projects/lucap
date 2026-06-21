// app/categories/page.tsx
import { getCategoriesForSelect } from '@/components/dashboard/categories/actions';
import CategoriesPageClient from '@/components/dashboard/categories/main';
export const dynamic = 'force-dynamic';
export default async function CategoriesPage() {
  const response = await getCategoriesForSelect();
  if (!response.success) {
    return (
      <div className="p-4">
        <p className="text-destructive">
          Error loading categories: {response.error}
        </p>
      </div>
    );
  }
  const categories = response.data || [];
  return <CategoriesPageClient initialCategories={categories} />;
}
