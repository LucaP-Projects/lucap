import { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import { getStoreBySlug } from "@/components/store/marketplace/actions";
import { ProductCard } from "@/components/store/marketplace/product-card";
import { StoreWithCompany } from "@/components/store/types";
import { Button } from "@/components/ui/button";
import { getSessionWithCompany } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Store",
  description: "Browse store products"
};

interface StorePageProps {
  params: Promise<{ "store-slug": string }>;
}

export default async function MarketplaceStorePage({ params }: StorePageProps) {
  const session = await getSessionWithCompany();

  if (!session?.user?.activeCompanyId) {
    redirect("/select-company");
  }

  const companySlug = session.activeCompany?.slug;
  if (!companySlug) {
    redirect("/select-company");
  }

  const { "store-slug": storeSlug } = await params;
  const storeResult = await getStoreBySlug(storeSlug);

  if (!storeResult.success || !storeResult.data) {
    notFound();
  }

  const store = storeResult.data as StoreWithCompany;
  const products = store.products || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/${companySlug}/marketplace`}>
          <Button variant="ghost" className="mb-2 pl-0 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </Link>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-indigo-900">{store.name}</h2>
          <p className="text-sm text-gray-600">
            {store.description || `Products from ${store.company.name}`}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-800">
          <Package className="h-5 w-5" />
          Products
        </h3>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Package className="h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-600">This store has no active products yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} companySlug={companySlug} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
