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
import { BillPaymentBasic } from './actions';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
const formatDate = (date: Date): string => format(date, 'PP');

export function createBillPaymentColumns(): ColumnDef<BillPaymentBasic>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <div onClick={(e) => e.stopPropagation()} className="px-1">
          <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" data-click-ignore="true" />
        </div>
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()} className="px-1">
          <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" data-click-ignore="true" />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'vendor',
      header: 'Vendor',
      cell: ({ row }) => <span>{row.original.vendor.displayName}</span>,
    },
    {
      id: 'amount',
      header: 'Amount',
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      id: 'paymentDate',
      header: 'Payment Date',
      cell: ({ row }) => formatDate(row.original.paymentDate),
    },
    {
      id: 'method',
      header: 'Method',
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.paymentMethod.replace(/_/g, ' ')}</Badge>
      ),
    },
    {
      id: 'reference',
      header: 'Reference',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.reference || '—'}</span>,
    },
    {
      id: 'allocations',
      header: 'Bills Paid',
      cell: ({ row }) => <span>{row.original.allocations.length}</span>,
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
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.id)}>Copy ID</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/bill-payments/${item.id}`)}>View Details</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
