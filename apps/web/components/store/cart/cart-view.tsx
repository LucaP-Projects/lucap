"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Minus, Plus, Loader2 } from "lucide-react";
import { updateCartItem } from "@/components/store/cart/actions";
import { placeOrder } from "@/components/store/orders/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { CartItemWithItem, StoreItem } from "../types";

interface CartViewProps {
  itemsByStore: Record<
    string,
    {
      store: { id: string; name: string; slug: string };
      items: CartItemWithItem[];
    }
  >;
  companySlug: string;
}

export function CartView({ itemsByStore, companySlug }: CartViewProps) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    Object.values(itemsByStore).forEach((group) => {
      group.items.forEach((item) => {
        initial[item.id] = item.quantity;
      });
    });
    return initial;
  });
  const [checkingOut, setCheckingOut] = useState<Record<string, boolean>>({});

  const getQuantity = (itemId: string) => quantities[itemId] ?? 1;

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantities((prev) => ({ ...prev, [cartItemId]: newQuantity }));
    const result = await updateCartItem({ cartItemId, quantity: newQuantity });
    if (!result.success) {
      toast.error(result.error || "Failed to update quantity");
    }
  };

  const removeItem = async (cartItemId: string) => {
    const result = await updateCartItem({ cartItemId, quantity: 0 });
    if (result.success) {
      toast.success("Removed from cart");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to remove item");
    }
  };

  const checkout = async (storeId: string) => {
    setCheckingOut((prev) => ({ ...prev, [storeId]: true }));
    try {
      const result = await placeOrder({ sellerStoreId: storeId });
      if (result.success) {
        toast.success("Order placed successfully");
        router.push(`/${companySlug}/orders`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to place order");
      }
    } finally {
      setCheckingOut((prev) => ({ ...prev, [storeId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {Object.values(itemsByStore).map((group) => {
        const storeTotal = group.items.reduce(
          (sum, item) => sum + Number(item.item.salesPrice) * getQuantity(item.id),
          0
        );

        return (
          <Card key={group.store.id}>
            <CardHeader>
              <CardTitle className="text-lg">{group.store.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.items.map((item) => {
                const qty = getQuantity(item.id);
                return (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                      {item.item.storeImages?.[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.item.storeImages[0].url}
                          alt={item.item.name}
                          className="h-full w-full rounded-md object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">No image</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-medium">{item.item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.item.salesPrice)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, qty - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value) || 1)
                        }
                        className="h-8 w-16 text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, qty + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="min-w-[80px] text-right font-medium">
                      {formatCurrency(Number(item.item.salesPrice) * qty)}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Store Subtotal</p>
                  <p className="text-xl font-bold">{formatCurrency(storeTotal)}</p>
                </div>
                <Button
                  onClick={() => checkout(group.store.id)}
                  disabled={checkingOut[group.store.id]}
                >
                  {checkingOut[group.store.id] ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
