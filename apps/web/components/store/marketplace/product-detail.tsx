"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Package, ShoppingCart, Check } from "lucide-react";
import { addToCart } from "@/components/store/cart/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { StoreItem } from "../types";

interface ProductDetailProps {
  product: StoreItem & {
    store?: {
      id: string;
      name: string;
      slug: string;
      company: { id: string; name: string; slug: string; logo: string | null };
    };
  };
  companySlug: string;
}

export function ProductDetail({ product, companySlug }: ProductDetailProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const result = await addToCart({ itemId: product.id, quantity });
      if (result.success) {
        setAdded(true);
        toast.success("Added to cart");
        setTimeout(() => setAdded(false), 2000);
      } else {
        toast.error(result.error || "Failed to add to cart");
      }
    } finally {
      setIsAdding(false);
    }
  };

  const isOutOfStock =
    product.quantityOnHand !== null && product.quantityOnHand <= 0;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="flex h-96 items-center justify-center rounded-xl bg-muted">
        {product.storeImages?.[0]?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.storeImages[0].url}
            alt={product.name}
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          <Package className="h-24 w-24 text-muted-foreground" />
        )}
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">
            {product.store?.company.name}
          </p>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-xl font-semibold">
            {formatCurrency(product.salesPrice)}
          </p>
        </div>

        <p className="text-muted-foreground">
          {product.storeShortDescription || product.description}
        </p>

        {product.storeFeatures && product.storeFeatures.length > 0 && (
          <div>
            <h3 className="mb-2 font-semibold">Features</h3>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              {product.storeFeatures.map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Order</CardTitle>
            <CardDescription>
              {isOutOfStock
                ? "This product is currently out of stock."
                : product.quantityOnHand !== null
                  ? `${product.quantityOnHand} available`
                  : "Available now"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.quantityOnHand || undefined}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isOutOfStock}
              />
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock}
              >
                {added ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/${companySlug}/cart`)}
              >
                View Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
