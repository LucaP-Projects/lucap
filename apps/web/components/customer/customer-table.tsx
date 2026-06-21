'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Checkbox } from 'radix-ui';
import { Plus, Printer, Search, Sheet, SquareArrowOutUpRight, Table } from 'lucide-react';

import {
  CustomerListItemDTO,
  CustomerStatistics
} from '@/company/src/types/customer';
import { CustomerForm } from '@/components/customer/customer-form';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { TableHeader, TableRow, TableHead, TableBody } from '../ui/table';
import CustomerFilterBar from './customer-filter';
import { CustomerRow } from './customer-row';
import { TableConfigDialog } from './table-config-dialog';

interface CustomerTableProps {
  customers: CustomerListItemDTO[];
  offset: number;
  totalCustomers: number;
  statistics: CustomerStatistics;
}

export function CustomerTable({
  customers,
  offset,
  totalCustomers,
  statistics
}: CustomerTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [columns, setColumns] = useState(['Address', 'Phone', 'Email']);
  const [pageSize, setPageSize] = useState(50);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [includeProjects, setIncludeProjects] = useState(false);

  const currentSearch = searchParams.get('search') ?? '';

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('search', value || '');
    params.set('offset', '0');
    router.push(`/customers?${params.toString()}`);
  };

  const handlePageChange = (newOffset: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('offset', newOffset.toString());
    router.push(`/customers?${params.toString()}`);
  };

  function handleCustomerCreated(): void {
    throw new Error('Function not implemented.');
  }

  return (
    <Card className="w-full overflow-x-hidden">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Customers</CardTitle>
            <CardDescription>
              Manage your customers and their payment events
            </CardDescription>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </SheetTrigger>
            <SheetContent className="xs:w-[384px] w-[calc(100%-20px)] overflow-y-auto md:w-[576px] md:max-w-[576px] lg:w-[752px] lg:max-w-[752px]">
              <SheetHeader className="mb-4 h-fit">
                <SheetTitle>Customer</SheetTitle>
              </SheetHeader>
              <CustomerForm type="create" onSuccess={handleCustomerCreated} />
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>
      <CardContent>
        <CustomerFilterBar statistics={statistics} />
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={currentSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 sm:flex-none">
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none">
                <SquareArrowOutUpRight className="h-4 w-4" />
              </Button>
              <TableConfigDialog
                columns={columns}
                setColumns={setColumns}
                pageSize={pageSize}
                setPageSize={setPageSize}
                includeInactive={includeInactive}
                setIncludeInactive={setIncludeInactive}
                includeProjects={includeProjects}
                setIncludeProjects={setIncludeProjects}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="uppercase text-black">
                <TableHead className="w-[40px]">
                  <Checkbox />
                </TableHead>
                <TableHead className="text-xs">Name</TableHead>
                {columns.includes('Company name') && (
                  <TableHead className="hidden text-xs sm:table-cell">
                    Company Name
                  </TableHead>
                )}
                {columns.includes('Address') && (
                  <TableHead className="hidden text-xs sm:table-cell">
                    Address
                  </TableHead>
                )}
                {columns.includes('Phone') && (
                  <TableHead className="hidden text-xs sm:table-cell">
                    Phone
                  </TableHead>
                )}
                {columns.includes('Mobile') && (
                  <TableHead className="hidden text-xs sm:table-cell">
                    Mobile
                  </TableHead>
                )}
                {columns.includes('Email') && (
                  <TableHead className="hidden text-xs sm:table-cell">
                    Email
                  </TableHead>
                )}
                {columns.includes('Sales tax') && (
                  <TableHead className="hidden text-xs sm:table-cell">
                    Sales Tax
                  </TableHead>
                )}
                {columns.includes('Customer type') && (
                  <TableHead className="hidden text-xs sm:table-cell">
                    Customer Type
                  </TableHead>
                )}
                {columns.includes('Attachments') && (
                  <TableHead className="hidden text-xs sm:table-cell">
                    Attachments
                  </TableHead>
                )}
                <TableHead className="hidden text-xs sm:table-cell">
                  Open Balance
                </TableHead>
                <TableHead className="w-[80px] text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <CustomerRow
                  key={customer.id}
                  columns={columns}
                  customer={customer}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-center text-sm sm:text-left">
          Showing {Math.min(offset + 1, totalCustomers)}-
          {Math.min(offset + pageSize, totalCustomers)} of {totalCustomers}{' '}
          customers
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(offset - pageSize)}
            disabled={offset === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(offset + pageSize)}
            disabled={offset + pageSize >= totalCustomers}
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
