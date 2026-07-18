import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getStore } from "@/components/store/actions";
import { getProducts, getStoreItemLists } from "@/components/store/products/actions";
import { ProductDetailsTable } from "@/components/store/products/product-details-table";
import { ProductManagerDialog } from "@/components/store/products/product-manager-dialog";
import { ProductWithImages } from "@/components/store/types";
import { Button } from "@/components/ui/button";
import { getSessionWithCompany } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Store Products",
  description: "Manage your store products"
};

export default async function StoreProductsPage() {
  const session = await getSessionWithCompany();

  if (!session?.user?.activeCompanyId) {
    redirect("/select-company");
  }

  const storeResult = await getStore();
  const store = storeResult.success ? storeResult.data : null;

  const companySlug = session.activeCompany?.slug;
  if (!companySlug) {
    redirect("/select-company");
  }

  if (!store) {
    redirect(`/${companySlug}/settings/store`);
  }

  const [productsResult, itemListsResult] = await Promise.all([
    getProducts(),
    getStoreItemLists()
  ]);
  const products = (productsResult.success ? productsResult.data : []) as ProductWithImages[];
  const itemLists = itemListsResult.success
    ? itemListsResult.data!
    : { available: [], selected: [] };

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-indigo-900">Products</h2>
          <p className="text-sm text-gray-600">
            Manage the products available in your store.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ProductManagerDialog
            initialAvailable={itemLists.available}
            initialSelected={itemLists.selected}
          />
          <Link href={`/${companySlug}/store/products/new`}>
            <Button className="bg-indigo-600 px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-indigo-700">
              <svg
                className="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-2 space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-gray-800">
          Product Details
          <span className="ml-2 text-sm font-normal text-gray-500">
            {products.length} product{products.length !== 1 ? "s" : ""} shown in your store
          </span>
        </h3>

        <ProductDetailsTable
          products={products}
          companySlug={companySlug}
          available={itemLists.available}
          selected={itemLists.selected}
        />
      </div>
    </div>
  );
}
