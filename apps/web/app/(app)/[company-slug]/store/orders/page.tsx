import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingBag, Settings } from "lucide-react";
import { getStore } from "@/components/store/actions";
import { getReceivedOrders } from "@/components/store/orders/actions";
import { StoreOrdersTable } from "@/components/store/orders/store-orders-table";
import { OrderWithDetails } from "@/components/store/types";
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
  title: "Store Orders",
  description: "Orders received from other companies"
};

export default async function StoreOrdersPage() {
  const session = await getSessionWithCompany();

  if (!session?.user?.activeCompanyId) {
    redirect("/select-company");
  }

  const companySlug = session.activeCompany?.slug;
  if (!companySlug) {
    redirect("/select-company");
  }

  const storeResult = await getStore(session.user.activeCompanyId);
  const store = storeResult.success ? storeResult.data : null;

  if (!store) {
    redirect(`/${companySlug}/settings/store`);
  }

  const ordersResult = await getReceivedOrders();
  const orders = (ordersResult.success ? ordersResult.data : []) as OrderWithDetails[];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Orders</h1>
          <p className="text-muted-foreground">
            Orders placed by other companies in your store.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/${companySlug}/settings/store`}>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Store Settings
            </Button>
          </Link>
          <Link href={`/${companySlug}/store/products/new`}>
            <Button>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Received Orders</CardTitle>
          <CardDescription>
            {orders.length} order{orders.length !== 1 ? "s" : ""} received.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StoreOrdersTable orders={orders} companySlug={companySlug} />
        </CardContent>
      </Card>
    </div>
  );
}
