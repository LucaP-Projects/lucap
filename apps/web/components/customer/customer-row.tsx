'use client';

import { useParams, useRouter } from 'next/navigation';
import { MoreHorizontal, Pencil, Trash2, UserRound } from 'lucide-react';

import { formatCurrency } from '@/lib/utils';
import { CustomerListItemDTO } from '@/types/customer';
import { deleteCustomer } from '../shared/customer/actions';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { TableRow, TableCell } from '../ui/table';

interface CustomerRowProps {
  customer: CustomerListItemDTO;
  columns: string[];
}

export function CustomerRow({ customer, columns }: CustomerRowProps) {
  const router = useRouter();
  const params = useParams<{ 'company-slug': string }>();
  const companySlug = params['company-slug'];

  function formatBillingAddress(billingAddress: PrismaJson.Address) {
    return `${billingAddress.line1}, ${billingAddress.city}, ${billingAddress.state} ${billingAddress.postalCode}`;
  }
  return (
    <TableRow>
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell className={'font-semibold ' + 'p-' + (customer.level + 1) * 2}>
        {customer.displayName}
      </TableCell>
      {columns.includes('Company name') && (
        <TableCell>{customer.companyName}</TableCell>
      )}
      {columns.includes('Address') && (
        <TableCell>
          {customer.billingAddress
            ? formatBillingAddress(customer.billingAddress)
            : ''}
        </TableCell>
      )}
      {columns.includes('Phone') && (
        <TableCell>{customer.primaryPhone}</TableCell>
      )}
      {columns.includes('Mobile') && <TableCell>{customer.mobile}</TableCell>}
      {columns.includes('Email') && (
        <TableCell>{customer.primaryEmail}</TableCell>
      )}
      {columns.includes('Customer type') && (
        <TableCell>{customer.customerType}</TableCell>
      )}
      {columns.includes('Attachments') && (
        <TableCell>{customer.attachments?.length || 0}</TableCell>
      )}
      <TableCell>{formatCurrency(customer.balance)}</TableCell>

      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => router.push(`/${companySlug}/customers/${customer.id}`)}
            >
              <UserRound className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/${companySlug}/customers/${customer.id}`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Customer
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={async () => {
                if (confirm('Are you sure you want to delete this customer?')) {
                  await deleteCustomer(customer.id);
                  router.refresh();
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Customer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
