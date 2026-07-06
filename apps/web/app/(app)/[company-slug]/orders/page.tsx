import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { getOrders } from "@/components/store/orders/actions";
import { OrderWithDetails } from "@/components/store/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { getSessionWithCompany } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Orders",
  description: "Orders placed with other companies"
};

export default async function MyOrdersPage() {
  const session = await getSessionWithCompany();

  if (!session?.user?.activeCompanyId) {
    redirect("/select-company");
  }

  const companySlug = session.activeCompany?.slug;
  if (!companySlug) {
    redirect("/select-company");
  }

  const ordersResult = await getOrders();
  const orders = (ordersResult.success ? ordersResult.data : []) as OrderWithDetails[];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">
            Track orders your company has placed with other businesses.
          </p>
        </div>
        <Link href={`/${companySlug}/marketplace`}>
          <Button variant="outline">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Marketplace
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Orders
          </CardTitle>
          <CardDescription>
            {orders.length} order{orders.length !== 1 ? "s" : ""} placed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
              <p className="text-muted-foreground">
                Start shopping in the marketplace to place your first order.
              </p>
              <Link href={`/${companySlug}/marketplace`} className="mt-4">
                <Button>Browse Marketplace</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.sellerCompany.name}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "DELIVERED"
                            ? "default"
                            : order.status === "CANCELLED"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/${companySlug}/orders/${order.id}`}>
                        <Button variant="ghost" size="sm">
                          View <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
