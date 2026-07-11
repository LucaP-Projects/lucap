'use client';
import { ColumnDef } from '@tanstack/react-table';
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
import { VendorBasic } from './actions';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export function createVendorColumns(): ColumnDef<VendorBasic>[] {
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
      accessorKey: 'displayName',
      header: 'Name',
    },
    {
      accessorKey: 'companyName',
      header: 'Company',
    },
    {
      accessorKey: 'primaryEmail',
      header: 'Email',
    },
    {
      accessorKey: 'primaryPhone',
      header: 'Phone',
    },
    {
      id: 'balance',
      header: 'Balance',
      cell: ({ row }) => (
        <span className={row.original.balance > 0 ? 'text-amber-600 font-medium' : ''}>
          {formatCurrency(row.original.balance)}
        </span>
      ),
    },
    {
      id: 'bills',
      header: 'Bills',
      cell: ({ row }) => <span>{row.original._count.bills}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={row.original.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'}>
          {row.original.status.charAt(0) + row.original.status.slice(1).toLowerCase()}
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
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.id)}>Copy ID</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/vendors/${item.id}`)}>View Details</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/vendors/${item.id}/edit`)}>Edit</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
