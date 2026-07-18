"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { ProductWithImages } from "@/components/store/types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { ProductDetail } from "./product-detail";
import { QuickAddToCartButton } from "./quick-add-to-cart-button";

interface ProductCardProps {
  product: ProductWithImages;
  companySlug: string;
}

export function ProductCard({ product, companySlug }: ProductCardProps) {
  const [open, setOpen] = useState(false);
  const isOutOfStock = product.quantityOnHand !== null && product.quantityOnHand <= 0;

  return (
    <div className="group relative">
      <Dialog open={open} onOpenChange={setOpen}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full flex-col overflow-hidden rounded-lg border border-gray-200 text-left transition-shadow hover:shadow-md"
        >
          <div className="flex h-32 items-center justify-center bg-gray-50">
            {product.storeImages?.[0]?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.storeImages[0].url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-10 w-10 text-gray-300" />
            )}
          </div>
          <div className="p-3">
            <p className="truncate text-xs text-gray-500">{product.store?.company.name}</p>
            <h4 className="truncate font-medium text-gray-900 group-hover:text-indigo-700">
              {product.name}
            </h4>
            <p className="mt-1 font-semibold text-gray-900">
              {formatCurrency(product.salesPrice)}
            </p>
          </div>
        </button>

        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
          <ProductDetail product={product} companySlug={companySlug} />
        </DialogContent>
      </Dialog>

      <QuickAddToCartButton
        itemId={product.id}
        disabled={isOutOfStock}
        className="absolute top-2 right-2 z-10"
      />
    </div>
  );
}
