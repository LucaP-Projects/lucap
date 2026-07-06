import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ShoppingBag, Settings, ArrowRight } from "lucide-react";
import { getStore } from "@/components/store/actions";
import { StoreWithCompany } from "@/components/store/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { getSessionWithCompany } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Store",
  description: "Manage your company store"
};

export default async function StorePage() {
  const session = await getSessionWithCompany();

  if (!session?.user?.activeCompanyId) {
    redirect("/select-company");
  }

  const storeResult = await getStore();
  const store = storeResult.success ? (storeResult.data as StoreWithCompany) : null;

  const companySlug = session.activeCompany?.slug;
  if (!companySlug) {
    redirect("/select-company");
  }

  if (!store) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Company Store</h1>
          <p className="text-muted-foreground">
            Sell your products and services to other companies in the LucaP ecosystem.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Store Not Enabled</CardTitle>
            <CardDescription>
              You haven&apos;t set up your company store yet. Enable it to start selling.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${companySlug}/settings/store`}>
              <Button>Set Up Store</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeProducts = store.products?.length || 0;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{store.name}</h1>
          <p className="text-muted-foreground">
            {store.isPublic
              ? "Your store is live in the marketplace."
              : "Your store is currently hidden from the marketplace."}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/${companySlug}/settings/store`}>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          <Link href={`/${companySlug}/store/products/new`}>
            <Button>
              <Package className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Store URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">/marketplace/{store.slug}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={`/${companySlug}/store/orders`}>
              <Button variant="ghost" className="h-auto p-0">
                View orders <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products
            </CardTitle>
            <CardDescription>Manage the products in your store.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${companySlug}/store/products`}>
              <Button variant="outline" className="w-full">
                Manage Products
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Orders
            </CardTitle>
            <CardDescription>View and fulfill orders from other companies.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${companySlug}/store/orders`}>
              <Button variant="outline" className="w-full">
                View Orders
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
