'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDate } from '@/lib/utils';
import { VendorCreditBasic } from './actions';

export function createVendorCreditColumns(): ColumnDef<VendorCreditBasic>[] {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'default';
      case 'CLOSED': return 'secondary';
      case 'PARTIALLY_APPLIED': return 'outline';
      case 'VOID': return 'destructive';
      default: return 'secondary';
    }
  };

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'number',
      header: 'Number',
      cell: ({ row }) => <span className="font-medium">{row.original.number}</span>,
    },
    {
      accessorFn: (row) => row.vendor?.displayName,
      id: 'vendor',
      header: 'Vendor',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: 'remainingCredit',
      header: 'Remaining',
      cell: ({ row }) => formatCurrency(row.original.remainingCredit),
    },
    {
      accessorKey: 'creditDate',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.creditDate),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={getStatusColor(row.original.status) as any}>
          {row.original.status.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const credit = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(credit.id)}>
                Copy ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }
  ];
}