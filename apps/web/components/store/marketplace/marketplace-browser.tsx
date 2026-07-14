"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Package, Search, Store } from "lucide-react";
import { ProductWithImages, StoreWithCompany } from "@/components/store/types";
import { Input } from "@/components/ui/input";
import { ProductCard } from "./product-card";

interface MarketplaceBrowserProps {
  companySlug: string;
  stores: StoreWithCompany[];
  products: ProductWithImages[];
}

export function MarketplaceBrowser({ companySlug, stores, products }: MarketplaceBrowserProps) {
  const [query, setQuery] = useState("");

  const filteredStores = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stores;
    return stores.filter(
      (store) =>
        store.name.toLowerCase().includes(q) ||
        store.description?.toLowerCase().includes(q) ||
        store.company.name.toLowerCase().includes(q)
    );
  }, [stores, query]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.store?.company.name.toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-sm">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stores and products..."
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-800">
          <Store className="h-5 w-5" />
          Featured Stores
        </h3>
        {filteredStores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Store className="h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-600">
              {stores.length === 0
                ? "No public stores available yet."
                : "No stores match your search."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStores.map((store) => (
              <Link
                key={store.id}
                href={`/${companySlug}/marketplace/${store.slug}`}
                className="group flex flex-col rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                    <Store className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">{store.name}</p>
                    <p className="truncate text-xs text-gray-500">{store.company.name}</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 flex-1 text-sm text-gray-600">
                  {store.description || "No description provided."}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    {store.productCount ?? 0} product{store.productCount === 1 ? "" : "s"}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-800">
          <Package className="h-5 w-5" />
          Featured Products
        </h3>
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Package className="h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-600">
              {products.length === 0
                ? "No products available in the marketplace yet."
                : "No products match your search."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} companySlug={companySlug} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
