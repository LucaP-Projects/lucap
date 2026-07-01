"use client";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import {
  getInvoiceById,
  getDelayedCreditById,
  getDelayedChargesById,
  getEstimateById,
  getSalesReceiptById,
  getRefundReceiptById,
  getCreditMemoById,
} from "@/app/(app)/[company-slug]/(dashboards)/pdf/[id]/actions";
import { useInvoiceRefresh } from "@/components/dashboard/invoices/useInvoiceRefresh";
import InvoicePaymentSheet from "@/components/payment-event/invoices/invoice-payment-sheet";
import { PaymentFormData } from "@/components/payment-event/invoices/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EstimateStatus,
  RefundStatus,
  CreditMemoStatus,
  ReceiptStatus,
  ChargeStatus,
  CreditStatus,
  PaymentStatus,
  PaymentMethod,
} from "@/lib/generated/prisma/enums";
import { mapInvoiceDataForPdf } from "@/utils/invoicePdfMapper";
import {
  getDocumentQualificationStatus,
  DocumentQualificationStatus,
} from "@/lib/document-qualification";

export type EntityStatus =
  | EstimateStatus
  | RefundStatus
  | CreditMemoStatus
  | ReceiptStatus
  | ChargeStatus
  | CreditStatus
  | PaymentStatus
  | DocumentQualificationStatus;

export type EntityType =
  | "estimate"
  | "refund"
  | "creditMemo"
  | "receipt"
  | "charge"
  | "credit"
  | "payment"
  | "invoice";

export interface EntityConfig {
  type: EntityType;
  getDetailUrl: (id: string) => string;
  getEditUrl: (id: string) => string;
  canEdit: (status: EntityStatus) => boolean;
  numberLabel: string;
}

interface BaseEntityCore {
  id: string;
  number: string;
  status: EntityStatus;
  customer?: {
    displayName: string;
    primaryEmail?: string | null;
  };

  amount?: number;
  totalAmount?: number;
  dueDate?: Date;
  createdAt?: Date;
  refundMethod?: PaymentMethod;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

const formatDate = (date: Date): string => format(date, "PP");

export const formatStatus = (status: EntityStatus): string =>
  status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");

export const getStatusColor = (status: EntityStatus): string => {
  const baseColors: Record<EntityStatus, string> = {
    DRAFT: "bg-gray-500 hover:bg-gray-600",
    PENDING: "bg-yellow-500 hover:bg-yellow-600",
    SENT: "bg-blue-500 hover:bg-blue-600",
    ACCEPTED: "bg-green-500 hover:bg-green-600",
    REJECTED: "bg-red-500 hover:bg-red-600",
    EXPIRED: "bg-gray-500 hover:bg-gray-600",
    CONVERTED: "bg-purple-500 hover:bg-purple-600",
    PROCESSED: "bg-green-500 hover:bg-green-600",
    CANCELLED: "bg-red-500 hover:bg-red-600",
    COMPLETED: "bg-green-500 hover:bg-green-600",
    VOID: "bg-gray-500 hover:bg-gray-600",
    REFUNDED: "bg-purple-500 hover:bg-purple-600",
    APPLIED: "bg-green-500 hover:bg-green-600",
    CREDITED: "bg-green-500 hover:bg-green-600",
    PAID: "bg-green-500 hover:bg-green-600",
    OVERDUE: "bg-red-500 hover:bg-red-600",
    PARTIAL: "bg-blue-500 hover:bg-blue-600",
    ISSUED: "bg-gray-500 hover:bg-gray-600",
    VOIDED: "bg-gray-500 hover:bg-gray-600",
    CANCELED: "bg-red-500 hover:bg-red-600",
    INVOICED: "bg-blue-500 hover:bg-blue-600",
    VALIDATED: "bg-green-500 hover:bg-green-600",
  };

  return baseColors[status] || "bg-gray-500 hover:bg-gray-600";
};

// Actions Cell Wrapper Component to handle React hooks properly
const ActionsCell = ({ row, config }: { row: any; config: EntityConfig }) => {
  const item = row.original;
  const status = item.status;
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshedInvoice, setRefreshedInvoice] = useState<any>(null);
  const router = useRouter();
  const { refreshInvoiceStatus } = useInvoiceRefresh();

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSheetClose = () => {
    setIsPaymentSheetOpen(false);
  };

  const handlePrintInvoice = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    try {
      let documentResult;
      switch (config.type) {
        case "invoice":
          documentResult = await getInvoiceById(itemId);
          break;
        case "credit":
          documentResult = await getDelayedCreditById(itemId);
          break;
        case "charge":
          documentResult = await getDelayedChargesById(itemId);
          break;
        case "estimate":
          documentResult = await getEstimateById(itemId);
          break;
        case "receipt":
          documentResult = await getSalesReceiptById(itemId);
          break;
        case "refund":
          documentResult = await getRefundReceiptById(itemId);
          break;
        case "creditMemo":
          documentResult = await getCreditMemoById(itemId);
          break;
        default:
          documentResult = await getInvoiceById(itemId);
      }

      if (!documentResult.success || !documentResult.data) {
        throw new Error(
          documentResult.error || `Failed to fetch ${config.type} data`,
        );
      }
      const pdfData = mapInvoiceDataForPdf(documentResult.data, config.type);
      const response = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pdfData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`PDF generation failed: ${error}`);
      }

      const pdfBlob = await response.blob();
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error printing invoice:", error);
      alert("Failed to print invoice. Please try again.");
    }
  };

  const handlePaymentSubmit = async (paymentData: PaymentFormData) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...paymentData, invoiceId: item.id }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to add payment");
      }

      setIsPaymentSheetOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const openPaymentSheet = async () => {
    setLoading(true);
    try {
      const result = await refreshInvoiceStatus(item.id);
      setRefreshedInvoice(result);
      setIsPaymentSheetOpen(true);
    } catch (error) {
      console.error("Failed to refresh invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div role="button" data-click-ignore="true" onClick={handleMenuClick}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={handleMenuClick}>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={handleMenuClick}>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={(e) =>
              handleAction(e, () => navigator.clipboard.writeText(item.id))
            }
          >
            Copy ID
          </DropdownMenuItem>
          {config.canEdit(status) && (
            <DropdownMenuItem
              onClick={(e) =>
                handleAction(
                  e,
                  () => (window.location.href = config.getEditUrl(item.id)),
                )
              }
            >
              Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={(e) =>
              handleAction(
                e,
                () => (window.location.href = config.getDetailUrl(item.id)),
              )
            }
          >
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => handlePrintInvoice(e, item.id)}
            disabled={loading}
          >
            {loading ? "Printing..." : "Print PDF"}
          </DropdownMenuItem>
          {config.type === "invoice" && (
            <DropdownMenuItem
              onClick={(e) => handleAction(e, openPaymentSheet)}
              disabled={loading}
            >
              {loading ? "Loading..." : "Add Payment"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {isPaymentSheetOpen && (
        <InvoicePaymentSheet
          invoice={refreshedInvoice || (item as any)}
          isOpen={isPaymentSheetOpen}
          onClose={handleSheetClose}
          onSubmitPayment={handlePaymentSubmit}
          isProcessing={loading}
        />
      )}
    </div>
  );
};

export function createColumns<T extends BaseEntityCore>(
  config: EntityConfig,
): ColumnDef<T>[] {
  // Get the refresh hook (will only be available in invoice tables)
  const InvoiceRefreshCell = ({ row }: { row: any }) => {
    const { getRefreshedStatus } = useInvoiceRefresh();
    const item = row.original;

    if (config.type !== "payment") {
      const qualificationStatus = getDocumentQualificationStatus(item.notes);
      if (qualificationStatus) {
        return (
          <Badge className={getStatusColor(qualificationStatus)}>
            {formatStatus(qualificationStatus)}
          </Badge>
        );
      }
      return (
        <Badge className="bg-gray-400 hover:bg-gray-500">Not reviewed</Badge>
      );
    }

    // Use refreshed status if available, otherwise use the original
    const status =
      getRefreshedStatus(item.id) || (row.getValue("status") as EntityStatus);

    return (
      <Badge className={getStatusColor(status)}>{formatStatus(status)}</Badge>
    );
  };

  return [
    {
      id: "select",
      header: ({ table }) => (
        <div onClick={(e) => e.stopPropagation()} className="px-1">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            data-click-ignore="true"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()} className="px-1">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            data-click-ignore="true"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "number",
      header: config.numberLabel,
    },
    {
      accessorKey: "customer.displayName",
      header: "Customer",
    },
    {
      id: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const value = row.original.totalAmount ?? row.original.amount ?? 0;
        return formatCurrency(value);
      },
    },
    {
      id: "date",
      header: "Date",
      cell: ({ row }) => {
        const date =
          row.original.dueDate ?? row.original.createdAt ?? new Date();
        return formatDate(date);
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <InvoiceRefreshCell row={row} />,
    },
    {
      id: "actions",
      cell: ({ row }) => <ActionsCell row={row} config={config} />,
    },
  ];
}

export const entityConfigs: Record<EntityType, EntityConfig> = {
  estimate: {
    type: "estimate",
    getDetailUrl: (id: string) => `/estimates/${id}`,
    getEditUrl: (id: string) => `/estimate/${id}`,
    canEdit: (status: EntityStatus) => true,
    numberLabel: "Estimate #",
  },
  creditMemo: {
    type: "creditMemo",
    getDetailUrl: (id: string) => `/creditmemos/${id}`,
    getEditUrl: (id: string) => `/creditmemo/${id}`,
    canEdit: (status: EntityStatus) => true,
    numberLabel: "Credit Memo #",
  },
  receipt: {
    type: "receipt",
    getDetailUrl: (id: string) => `/receipts/${id}`,
    getEditUrl: (id: string) => `/salesreceipt/${id}`,
    canEdit: (status: EntityStatus) =>
      !["VOIDED", "REFUNDED"].includes(status as string),
    numberLabel: "Receipt #",
  },
  refund: {
    type: "refund",
    getDetailUrl: (id: string) => `/refunds/${id}`,
    getEditUrl: (id: string) => `/refundreceipt/${id}`,
    canEdit: (status: EntityStatus) => true,
    numberLabel: "Refund #",
  },
  charge: {
    type: "charge",
    getDetailUrl: (id: string) => `/charges/${id}`,
    getEditUrl: (id: string) => `/delayedcharge/${id}`,
    canEdit: (status: EntityStatus) => true,
    numberLabel: "Charge #",
  },
  credit: {
    type: "credit",
    getDetailUrl: (id: string) => `/credits/${id}`,
    getEditUrl: (id: string) => `/delayedcredit/${id}`,
    canEdit: (status: EntityStatus) => true,
    numberLabel: "Credit #",
  },
  payment: {
    type: "payment",
    getDetailUrl: (id: string) => `/payments/${id}`,
    getEditUrl: (id: string) => `/payment/${id}`,
    canEdit: (status: EntityStatus) => true,
    numberLabel: "Payment #",
  },
  invoice: {
    type: "invoice",
    getDetailUrl: (id: string) => `/invoices/${id}`,
    getEditUrl: (id: string) => `/invoice/${id}`,
    canEdit: (status: EntityStatus) => true,
    numberLabel: "Invoice #",
  },
} as const;
