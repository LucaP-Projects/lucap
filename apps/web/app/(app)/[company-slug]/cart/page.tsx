import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingCart, ArrowLeft, Store } from "lucide-react";
import { getCart } from "@/components/store/cart/actions";
import { CartView } from "@/components/store/cart/cart-view";
import { CartItemWithItem } from "@/components/store/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSessionWithCompany } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Cart",
  description: "Your shopping cart"
};

export default async function CartPage() {
  const session = await getSessionWithCompany();

  if (!session?.user?.activeCompanyId) {
    redirect("/select-company");
  }

  const companySlug = session.activeCompany?.slug;
  if (!companySlug) {
    redirect("/select-company");
  }

  const cartResult = await getCart();
  const cart = (cartResult.success ? cartResult.data : { items: [] }) as { id: string; companyId: string; items: CartItemWithItem[] };

  const itemsByStoreMap = new Map<string, { store: { id: string; name: string; slug: string }; items: CartItemWithItem[] }>();
  for (const item of cart.items as CartItemWithItem[]) {
    const store = item.item.company?.store;
    if (!store) continue;
    const existing = itemsByStoreMap.get(store.id);
    if (existing) {
      existing.items.push(item);
    } else {
      itemsByStoreMap.set(store.id, { store, items: [item] });
    }
  }
  const itemsByStore = Object.fromEntries(itemsByStoreMap);

  return (
    <div className="container mx-auto py-6">
      <Link href={`/${companySlug}/marketplace`}>
        <Button variant="ghost" className="mb-4 pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continue Shopping
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <p className="text-muted-foreground">
          Review your items and place orders with other companies.
        </p>
      </div>

      {cart.items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground">
              Browse the marketplace to find products from other companies.
            </p>
            <Link href={`/${companySlug}/marketplace`} className="mt-4">
              <Button>
                <Store className="mr-2 h-4 w-4" />
                Browse Marketplace
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <CartView itemsByStore={itemsByStore} companySlug={companySlug} />
      )}
    </div>
  );
}
