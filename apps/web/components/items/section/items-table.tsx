'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Edit,
  MoreHorizontal,
  CheckCircle2,
  PauseCircle,
  Ban,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Package,
  Trash2,
  Table
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';
import { useMediaQuery } from '@/hooks/use-media-query';
import { formatCurrency, formatDate } from '@/lib/utils';
import { updateItemStatus, getItems } from '../actions';
import { ItemSheet } from './item-sheet';
import { ItemsTableSkeleton } from './items-table-skeleton';

interface ItemsTableProps {
  initialItems: any[];
  initialTotalPages?: number;
}

function getFormattedPriceDisplay(item: any) {
  if (!item.sellable) {
    return 'N/A';
  }

  const originalPrice = Number(item.salesPrice) || 0;
  if (
    item.status === 'DISCONTINUED' &&
    item.discountType &&
    typeof item.discountValue === 'number' &&
    item.discountValue > 0
  ) {
    let discountedPrice = originalPrice;

    if (item.discountType === 'PERCENTAGE') {
      discountedPrice = originalPrice * (1 - item.discountValue / 100);
    } else if (item.discountType === 'FIXED_AMOUNT') {
      discountedPrice = originalPrice - item.discountValue;
    }
    discountedPrice = Math.max(discountedPrice, 0);
    return (
      <span className="flex flex-col">
        <span className="text-muted-foreground line-through">
          {formatCurrency(originalPrice)}
        </span>
        <span className="font-medium text-red-600">
          {formatCurrency(discountedPrice)}
        </span>
      </span>
    );
  }
  return formatCurrency(originalPrice);
}

export function ItemsTable({
  initialItems = [],
  initialTotalPages = 1
}: ItemsTableProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [editItem, setEditItem] = React.useState<any>(null);
  const [search, setSearch] = React.useState('');
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const debouncedSearch = useDebounce(search, 300);

  // Pagination state
  const [items, setItems] = useState<any[]>(initialItems || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 10;
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getItems(currentPage, pageSize, debouncedSearch);
      if (response.success && response.data) {
        setItems(response.data);
        if (response.totalPages) {
          setTotalPages(response.totalPages);
        }
      } else {
        toast.error('Failed to load items',{
          description:
            response.error || 'An error occurred while loading items',
        });
      }
    } catch (error) {
      toast.error('Failed to fetch items', {
        description: 'An error occurred while fetching items',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch]);
  useEffect(() => {
    fetchItems();
  }, [currentPage, debouncedSearch]);

  // Reset to page 1 when search changes (but prevent calling fetchItems twice)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearch]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  const handleEdit = (item: any) => {
    setEditItem(item);
    setSheetOpen(true);
  };

  const handleEditSuccess = () => {
    setEditItem(null);
    setSheetOpen(false);
    fetchItems();
  };

  const handleSheetClose = () => {
    setSheetOpen(false);
    setEditItem(null);
    fetchItems();
  };

  // Status change handler
  const handleStatusChange = async (
    item: any,
    status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
  ) => {
    try {
      const res = await updateItemStatus(item.id, status);
      if (res.success) {
        // Prepare discount information for the toast
        let discountInfo = '';

        // Only show discount info if status is DISCONTINUED
        if (item.sellable && status === 'DISCONTINUED') {
          // Check for discount properties
          if (item.discountType && item.discountValue !== null) {
            const discountType = item.discountType;
            const discountValue = parseFloat(item.discountValue) || 0;

            const discountTypeDisplay =
              discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount';

            const formattedValue =
              discountType === 'PERCENTAGE'
                ? `${discountValue}%`
                : `$${discountValue.toFixed(2)}`;

            discountInfo = `\nDiscount: ${discountTypeDisplay} (${formattedValue})`;
          } else {
            // No discount configured
            discountInfo = '\nDiscount: 0%';
          }

          // Add note about editing
          discountInfo += '\n(To change discount values, use the Edit option)';
        }
        toast.success(`Status changed to ${status}${discountInfo}`);
        fetchItems();
      } else {
        toast.error('Status Update Failed', {
          description: res.error || 'Failed to update status'
        });
      }
    } catch (e) {
      toast.error('Status Update Failed', {
        description: 'Failed to update status'
      });
    }
  };
  const ItemActions = ({ item }: { item: any }) => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 rounded-lg p-0 transition-colors hover:bg-blue-100"
        >
          <MoreHorizontal className="h-4 w-4 text-gray-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 rounded-xl border-0 py-2 shadow-xl"
      >
        <DropdownMenuItem
          onClick={() => handleEdit(item)}
          className="mx-2 cursor-pointer rounded-lg px-3 py-2 hover:bg-gray-50"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Item
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Change Item Status</DropdownMenuLabel>{' '}
        <DropdownMenuItem
          onClick={() => handleStatusChange(item, 'ACTIVE')}
          className={
            item.status === 'ACTIVE'
              ? 'mx-2 cursor-pointer rounded-lg bg-green-100 px-3 py-2 font-bold text-green-700'
              : 'mx-2 cursor-pointer rounded-lg px-3 py-2 hover:bg-gray-50'
          }
        >
          <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
          Mark as Active
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange(item, 'INACTIVE')}
          className={
            item.status === 'INACTIVE'
              ? 'mx-2 cursor-pointer rounded-lg bg-yellow-100 px-3 py-2 font-bold text-yellow-700'
              : 'mx-2 cursor-pointer rounded-lg px-3 py-2 hover:bg-gray-50'
          }
        >
          <PauseCircle className="mr-2 h-4 w-4 text-yellow-600" />
          Mark as Inactive
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange(item, 'DISCONTINUED')}
          className={
            item.status === 'DISCONTINUED'
              ? 'mx-2 cursor-pointer rounded-lg bg-red-100 px-3 py-2 font-bold text-red-700'
              : 'mx-2 cursor-pointer rounded-lg px-3 py-2 hover:bg-gray-50'
          }
        >
          <Ban className="mr-2 h-4 w-4 text-red-600" />
          Mark as Discontinued
        </DropdownMenuItem>{' '}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const getStatusBadge = (status: string) => (
      <Badge
        variant={
          status === 'ACTIVE'
            ? 'default'
            : status === 'INACTIVE'
              ? 'secondary'
              : 'destructive'
        }
      >
        {status}
      </Badge>
    );

  const getTypeBadge = (type: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'outline' | 'destructive' 
    > = {
      INVENTORY: 'default',
      NON_INVENTORY: 'secondary',
      SERVICE: 'outline'
    };

    return <Badge variant={variants[type] || 'secondary'}>{type}</Badge>;
  };

  // Pagination UI component
  const PaginationControls = () => (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevPage}
          disabled={currentPage <= 1 || isLoading}
          className="border-input bg-background hover:bg-accent rounded-full border shadow-sm transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              type="button"
              className={`mx-0.5 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                currentPage === i + 1
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
              onClick={() => setCurrentPage(i + 1)}
              disabled={isLoading}
              aria-current={currentPage === i + 1 ? 'page' : undefined}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextPage}
          disabled={currentPage >= totalPages || isLoading}
          className="border-input bg-background hover:bg-accent rounded-full border shadow-sm transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      <div className="text-muted-foreground mt-1 text-xs">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  ); // If loading, show skeleton UI (only for initial load without search)
  if (
    isLoading &&
    !debouncedSearch &&
    currentPage === 1 &&
    items.length === 0
  ) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50/30 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <ItemsTableSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50/30 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 shadow-2xl md:p-8 lg:p-10">
          <div className="absolute inset-0 bg-linear-to-r from-blue-600/90 to-indigo-700/90" />
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-20 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-white md:text-4xl">
                Items & Services
              </h1>
              <p className="text-base font-medium text-blue-100 md:text-lg">
                Manage your products, services, and inventory
              </p>
            </div>{' '}
            <div className="shrink-0">
              <Button
                onClick={() => setSheetOpen(true)}
                className="w-full border-0 bg-white px-6 py-3 font-semibold text-blue-700 shadow-lg transition-all duration-300 hover:bg-blue-50 hover:shadow-xl md:w-auto"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Item
              </Button>
            </div>
          </div>
        </div>
        {/* Search Section */}
        <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 rounded-xl border-gray-200 pl-12 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </CardContent>
        </Card>
        {/* Enhanced Items Table/Cards */}
        <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-xl">
          <CardHeader className="border-b border-gray-100 bg-linear-to-r from-gray-50 to-blue-50/50 px-6 py-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-gray-900 md:text-2xl">
                  Items Overview
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Manage and configure your business items and services
                </CardDescription>
              </div>
              <div className="rounded-full border bg-white px-4 py-2 text-sm text-gray-500 shadow-sm">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </div>
            </div>
          </CardHeader>

          {/* Mobile Card Layout */}
          <div className="block md:hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                <p className="text-lg font-medium text-gray-500">
                  Loading items...
                </p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-6 px-6 py-20">
                <div className="rounded-full bg-linear-to-r from-blue-100 to-indigo-100 p-6">
                  <Package className="h-16 w-16 text-blue-600" />
                </div>
                <div className="max-w-md space-y-3 text-center">
                  <h3 className="text-xl font-bold text-gray-900">
                    No items found
                  </h3>{' '}
                  <p className="text-base text-gray-500">
                    {debouncedSearch
                      ? 'No items match your search criteria. Try adjusting your search terms.'
                      : 'Get started by creating your first item to manage your inventory effectively.'}
                  </p>
                </div>{' '}
                {!debouncedSearch && (
                  <Button
                    onClick={() => setSheetOpen(true)}
                    className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create your first item
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="mb-1 text-lg font-bold text-gray-900">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="mb-2 text-sm text-gray-500">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <ItemActions item={item} />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                            Type
                          </p>
                          {getTypeBadge(item.type)}
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                            Status
                          </p>
                          {getStatusBadge(item.status)}
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                            Category
                          </p>
                          <p className="font-semibold text-gray-900">
                            {item.category?.name || 'None'}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                            Price
                          </p>
                          <span className="inline-flex items-center rounded-md border border-green-200 bg-linear-to-r from-green-100 to-emerald-100 px-2 py-1 text-sm font-semibold text-green-800">
                            {getFormattedPriceDisplay(item)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 border-t border-gray-100 pt-3">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                          Created Date
                        </p>
                        <p className="font-medium text-gray-600">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="h-12 px-6 text-left font-bold text-gray-800">
                    Name
                  </TableHead>
                  <TableHead className="h-12 px-4 text-left font-bold text-gray-800">
                    Type
                  </TableHead>
                  <TableHead className="h-12 px-4 text-left font-bold text-gray-800">
                    Status
                  </TableHead>
                  <TableHead className="h-12 px-4 text-left font-bold text-gray-800">
                    Category
                  </TableHead>
                  <TableHead className="h-12 px-4 text-left font-bold text-gray-800">
                    Price
                  </TableHead>
                  <TableHead className="h-12 px-4 text-left font-bold text-gray-800">
                    Created
                  </TableHead>
                  <TableHead className="h-12 w-16 px-4 text-center" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                        <p className="text-lg font-medium text-gray-500">
                          Loading items...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-96 px-6 text-center">
                      <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="rounded-full bg-linear-to-r from-blue-100 to-indigo-100 p-6">
                          <Package className="h-16 w-16 text-blue-600" />
                        </div>
                        <div className="max-w-md space-y-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            No items found
                          </h3>{' '}
                          <p className="text-center text-base text-gray-500">
                            {debouncedSearch
                              ? 'No items match your search criteria. Try adjusting your search terms.'
                              : 'Get started by creating your first item to manage your inventory effectively.'}
                          </p>
                        </div>{' '}
                        {!debouncedSearch && (
                          <div className="mt-2">
                            <Button
                              onClick={() => setSheetOpen(true)}
                              className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
                            >
                              <Plus className="mr-2 h-5 w-5" />
                              Create your first item
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow
                      key={item.id}
                      className="group h-16 border-b border-gray-50 transition-all duration-200 hover:bg-blue-50/30"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-base font-bold text-gray-900 transition-colors group-hover:text-blue-700">
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="line-clamp-1 text-sm font-medium text-gray-500">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        {getTypeBadge(item.type)}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        {getStatusBadge(item.status)}
                      </TableCell>
                      <TableCell className="px-4 py-4 font-semibold text-gray-700">
                        {item.category?.name || 'None'}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <span className="inline-flex items-center rounded-md border border-green-200 bg-linear-to-r from-green-100 to-emerald-100 px-2 py-1 text-sm font-semibold text-green-800">
                          {getFormattedPriceDisplay(item)}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-4 font-medium text-gray-600">
                        {formatDate(item.createdAt)}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center">
                        <ItemActions item={item} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
        {/* Pagination Controls */}
        <div className="flex justify-center">
          <PaginationControls />
        </div>{' '}
        {/* Item Sheet for editing */}
        <ItemSheet
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(null)}
          initialData={editItem}
          onSuccess={handleEditSuccess}
        />
        {/* Item Sheet for creating */}
        <ItemSheet
          open={sheetOpen && !editItem}
          onOpenChange={setSheetOpen}
          onSuccess={handleSheetClose}
        />
      </div>
    </div>
  );
}
