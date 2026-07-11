'use client';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PurchaseBasic } from './actions';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const formatDate = (date: Date): string => format(date, 'PP');

const formatStatus = (status: string): string =>
  status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ');

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    OPEN: 'bg-blue-500 hover:bg-blue-600',
    CLOSED: 'bg-green-500 hover:bg-green-600',
    VOID: 'bg-gray-500 hover:bg-gray-600',
  };
  return colors[status] || 'bg-gray-500 hover:bg-gray-600';
};

const getPaymentTypeLabel = (type: string): string =>
  type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function createPurchaseColumns(): ColumnDef<PurchaseBasic>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <div onClick={(e) => e.stopPropagation()} className="px-1">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
      accessorKey: 'number',
      header: 'Purchase #',
    },
    {
      accessorKey: 'vendor.displayName',
      header: 'Vendor',
    },
    {
      id: 'amount',
      header: 'Amount',
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: 'paymentType',
      header: 'Payment',
      cell: ({ row }) => getPaymentTypeLabel(row.original.paymentType),
    },
    {
      id: 'date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.txnDate),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {formatStatus(row.original.status)}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original;
        const router = useRouter();
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.id)}>
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/purchases/${item.id}`)}>
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}