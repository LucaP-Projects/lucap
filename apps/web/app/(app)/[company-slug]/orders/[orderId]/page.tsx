import { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Package, FileText } from "lucide-react";
import { getOrderById } from "@/components/store/orders/actions";
import { OrderWithDetails } from "@/components/store/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSessionWithCompany } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order Details",
  description: "View order details"
};

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await getSessionWithCompany();

  if (!session?.user?.activeCompanyId) {
    redirect("/select-company");
  }

  const companySlug = session.activeCompany?.slug;
  if (!companySlug) {
    redirect("/select-company");
  }

  const { orderId } = await params;
  const orderResult = await getOrderById(orderId);

  if (!orderResult.success || !orderResult.data) {
    notFound();
  }

  const order = orderResult.data as OrderWithDetails;
  const isBuyer = order.buyerCompanyId === session.user.activeCompanyId;

  return (
    <div className="container mx-auto py-6">
      <Link href={`/${companySlug}/orders`}>
        <Button variant="ghost" className="mb-4 pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order {order.orderNumber}</h1>
          <p className="text-muted-foreground">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
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
          <Badge variant="outline">{order.fulfillmentStatus}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.itemName}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.total)}</p>
                </div>
              ))}

              <Separator />

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isBuyer ? "Seller" : "Buyer"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">
                {isBuyer ? order.sellerCompany.name : order.buyerCompany.name}
              </p>
              <p className="text-sm text-muted-foreground">{order.sellerStore.name}</p>
            </CardContent>
          </Card>

          {order.invoice && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Invoice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{order.invoice.number}</p>
                <p className="text-sm text-muted-foreground">
                  Status: {order.invoice.status}
                </p>
                <p className="text-sm text-muted-foreground">
                  Amount: {formatCurrency(order.invoice.amount)}
                </p>
                {isBuyer && (
                  <Link href={`/${companySlug}/invoices/${order.invoice.id}`}>
                    <Button variant="outline" className="mt-4 w-full">
                      View Invoice
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
