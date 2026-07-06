"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { OrderStatus, FulfillmentStatus } from "@/lib/generated/prisma/enums";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderWithDetails } from "../types";
import { updateOrderStatus, createInvoiceFromOrder } from "./actions";

interface StoreOrdersTableProps {
  orders: OrderWithDetails[];
  companySlug: string;
}

const statusOptions: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED"
];

const fulfillmentOptions: FulfillmentStatus[] = [
  "PENDING",
  "PICKING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "RETURNED"
];

export function StoreOrdersTable({ orders, companySlug }: StoreOrdersTableProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [invoicing, setInvoicing] = useState<Record<string, boolean>>({});

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdating((prev) => ({ ...prev, [orderId]: true }));
    try {
      const result = await updateOrderStatus({ orderId, status });
      if (result.success) {
        toast.success("Order status updated");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleFulfillmentChange = async (
    orderId: string,
    fulfillmentStatus: FulfillmentStatus
  ) => {
    setUpdating((prev) => ({ ...prev, [orderId]: true }));
    try {
      const result = await updateOrderStatus({ orderId, fulfillmentStatus });
      if (result.success) {
        toast.success("Fulfillment status updated");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleCreateInvoice = async (orderId: string) => {
    setInvoicing((prev) => ({ ...prev, [orderId]: true }));
    try {
      const result = await createInvoiceFromOrder(orderId);
      if (result.success) {
        toast.success("Invoice created");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create invoice");
      }
    } finally {
      setInvoicing((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No orders received yet.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order #</TableHead>
          <TableHead>Buyer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Fulfillment</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">
              <Link href={`/${companySlug}/orders/${order.id}`}>{order.orderNumber}</Link>
            </TableCell>
            <TableCell>{order.buyerCompany.name}</TableCell>
            <TableCell>{formatDate(order.createdAt)}</TableCell>
            <TableCell>
              <Select
                value={order.status}
                onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                disabled={updating[order.id]}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Select
                value={order.fulfillmentStatus}
                onValueChange={(value) =>
                  handleFulfillmentChange(order.id, value as FulfillmentStatus)
                }
                disabled={updating[order.id]}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fulfillmentOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>{formatCurrency(order.total)}</TableCell>
            <TableCell className="text-right">
              {order.invoice ? (
                <Badge variant="outline">Invoiced</Badge>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCreateInvoice(order.id)}
                  disabled={invoicing[order.id]}
                >
                  {invoicing[order.id] ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <FileText className="mr-1 h-3 w-3" />
                  )}
                  Invoice
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
