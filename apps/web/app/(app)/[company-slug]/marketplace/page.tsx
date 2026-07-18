import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPublicStores, getMarketplaceProducts } from "@/components/store/marketplace/actions";
import { MarketplaceBrowser } from "@/components/store/marketplace/marketplace-browser";
import { StoreWithCompany, ProductWithImages } from "@/components/store/types";
import { getSessionWithCompany } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Discover products and services from other companies"
};

export default async function MarketplacePage() {
  const session = await getSessionWithCompany();

  if (!session?.user?.activeCompanyId) {
    redirect("/select-company");
  }

  const companySlug = session.activeCompany?.slug;
  if (!companySlug) {
    redirect("/select-company");
  }

  const [storesResult, productsResult] = await Promise.all([
    getPublicStores(),
    getMarketplaceProducts()
  ]);

  const stores = (storesResult.success ? storesResult.data : []) as StoreWithCompany[];
  const products = (productsResult.success ? productsResult.data : []) as ProductWithImages[];

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-indigo-900">Marketplace</h2>
        <p className="text-sm text-gray-600">
          Discover products and services from other companies in the LucaP ecosystem.
        </p>
      </div>

      <MarketplaceBrowser companySlug={companySlug} stores={stores} products={products} />
    </div>
  );
}
