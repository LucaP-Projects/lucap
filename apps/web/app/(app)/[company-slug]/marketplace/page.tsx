import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Store, Package, ArrowRight } from "lucide-react";
import { getPublicStores, getMarketplaceProducts } from "@/components/store/marketplace/actions";
import { StoreWithCompany, ProductWithImages } from "@/components/store/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { getSessionWithCompany } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

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
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-muted-foreground">
          Discover products and services from other companies in the LucaP ecosystem.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Featured Stores</h2>
        {stores.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No public stores available yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <Link key={store.id} href={`/${companySlug}/marketplace/${store.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      {store.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {store.description || store.company.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {store.products?.length || 0} products
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Featured Products</h2>
        {products.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No products available in the marketplace yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <Link
                key={product.id}
                href={`/${companySlug}/marketplace/${product.store?.slug}/${product.slug}`}
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex h-32 items-center justify-center rounded-md bg-muted">
                      {product.images?.[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="h-full w-full rounded-md object-cover"
                        />
                      ) : (
                        <Package className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {product.store?.company.name}
                    </p>
                    <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                    <p className="mt-1 font-medium">{formatCurrency(product.price)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
