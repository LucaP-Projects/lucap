import { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Package, ArrowLeft } from "lucide-react";
import { getStoreBySlug } from "@/components/store/actions";
import { StoreWithCompany } from "@/components/store/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card";
import { getSessionWithCompany } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

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
    <div className="container mx-auto py-6">
      <Link href={`/${companySlug}/marketplace`}>
        <Button variant="ghost" className="mb-4 pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{store.name}</h1>
        <p className="text-muted-foreground">
          {store.description || `Products from ${store.company.name}`}
        </p>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            This store has no active products yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/${companySlug}/marketplace/${store.slug}/${product.storeSlug}`}
            >
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex h-40 items-center justify-center rounded-md bg-muted">
                    {product.storeImages?.[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.storeImages[0].url}
                        alt={product.name}
                        className="h-full w-full rounded-md object-cover"
                      />
                    ) : (
                      <Package className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {product.storeShortDescription || product.description}
                  </p>
                  <p className="mt-2 font-medium">{formatCurrency(product.salesPrice)}</p>
                  {product.quantityOnHand !== null && product.quantityOnHand <= 5 && product.quantityOnHand > 0 && (
                    <Badge variant="secondary" className="mt-2">
                      Only {product.quantityOnHand} left
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
