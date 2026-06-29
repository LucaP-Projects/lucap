'use client';

import * as React from 'react';
import {
  DollarSign,
  Edit,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Trash2
} from 'lucide-react';
import {
  deleteTaxRate,
  getTaxRates,
  TaxRateData
} from '@/components/tax/action';
import { TaxSheet } from '@/components/tax/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
   DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';

export default function TaxRatesPage() {
  const [taxRates, setTaxRates] = React.useState<TaxRateData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingTax, setEditingTax] = React.useState<TaxRateData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [taxToDelete, setTaxToDelete] = React.useState<TaxRateData | null>(
    null
  );
  const [isDeleting, setIsDeleting] = React.useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const fetchTaxRates = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getTaxRates(debouncedSearch);
      if (response.success) {
        setTaxRates(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching tax rates:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  React.useEffect(() => {
    fetchTaxRates();
  }, [fetchTaxRates]);

  const handleDelete = async (taxRate: TaxRateData) => {
    setTaxToDelete(taxRate);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!taxToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteTaxRate(taxToDelete.id);
      if (response.success) {
        fetchTaxRates();
        setDeleteDialogOpen(false);
        setTaxToDelete(null);
      } else {
        alert(response.error || 'Failed to delete tax rate');
      }
    } catch (error) {
      console.error('Error deleting tax rate:', error);
      alert('Failed to delete tax rate');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (taxRate: TaxRateData) => {
    setEditingTax(taxRate);
    setSheetOpen(true);
  };

  const handleSheetClose = () => {
    setSheetOpen(false);
    setEditingTax(null);
    fetchTaxRates();
  };

  const getStatusBadge = (status: string) => (
      <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}>
        {status}
      </Badge>
    );

  const getTypeBadge = (type: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'outline' | 'destructive'
    > = {
      SALES: 'default',
      VAT: 'secondary',
      GST: 'outline',
      SERVICE: 'destructive',
      OTHER: 'secondary'
    };

    return <Badge variant={variants[type] || 'secondary'}>{type}</Badge>;
  };

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
                Tax Management
              </h1>
              <p className="text-base font-medium text-blue-100 md:text-lg">
                Configure and manage your business tax rates
              </p>
            </div>
            <div className="shrink-0">
              <TaxSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onSuccess={handleSheetClose}
                editData={editingTax}
              >
                <Button className="w-full border-0 bg-white px-6 py-3 font-semibold text-blue-700 shadow-lg transition-all duration-300 hover:bg-blue-50 hover:shadow-xl md:w-auto">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Tax Rate
                </Button>
              </TaxSheet>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search tax rates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 rounded-xl border-gray-200 pl-12 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tax Rates Table/Cards */}
        <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-xl">
          <CardHeader className="border-b border-gray-100 bg-linear-to-r from-gray-50 to-blue-50/50 px-6 py-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-gray-900 md:text-2xl">
                  Tax Rates Overview
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Manage and configure your business tax rates
                </CardDescription>
              </div>
              <div className="rounded-full border bg-white px-4 py-2 text-sm text-gray-500 shadow-sm">
                {taxRates.length} {taxRates.length === 1 ? 'rate' : 'rates'}
              </div>
            </div>
          </CardHeader>

          {/* Mobile Card Layout */}
          <div className="block md:hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                <p className="text-lg font-medium text-gray-500">
                  Loading tax rates...
                </p>
              </div>
            ) : taxRates.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-6 px-6 py-20">
                <div className="rounded-full bg-linear-to-r from-blue-100 to-indigo-100 p-6">
                  <DollarSign className="h-16 w-16 text-blue-600" />
                </div>
                <div className="max-w-md space-y-3 text-center">
                  <h3 className="text-xl font-bold text-gray-900">
                    No tax rates found
                  </h3>
                  <p className="text-base text-gray-500">
                    {search
                      ? 'No tax rates match your search criteria. Try adjusting your search terms.'
                      : 'Get started by creating your first tax rate to manage your business taxes effectively.'}
                  </p>
                </div>
                {!search && (
                  <TaxSheet
                    open={sheetOpen}
                    onOpenChange={setSheetOpen}
                    onSuccess={handleSheetClose}
                  >
                    <Button className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl">
                      <Plus className="mr-2 h-5 w-5" />
                      Create your first tax rate
                    </Button>
                  </TaxSheet>
                )}
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {taxRates.map((taxRate) => (
                  <Card
                    key={taxRate.id}
                    className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="mb-1 text-lg font-bold text-gray-900">
                            {taxRate.name}
                          </h3>
                          {taxRate.description && (
                            <p className="mb-2 text-sm text-gray-500">
                              {taxRate.description}
                            </p>
                          )}
                        </div>
                        <DropdownMenu>
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
                              onClick={() => handleEdit(taxRate)}
                              className="mx-2 cursor-pointer rounded-lg px-3 py-2 hover:bg-gray-50"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(taxRate)}
                              className="mx-2 cursor-pointer rounded-lg px-3 py-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                            Agency
                          </p>
                          <p className="font-semibold text-gray-900">
                            {taxRate.agencyName}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                            Type
                          </p>
                          {getTypeBadge(taxRate.type)}
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                            Rate
                          </p>
                          <span className="inline-flex items-center rounded-md border border-green-200 bg-linear-to-r from-green-100 to-emerald-100 px-2 py-1 text-sm font-semibold text-green-800">
                            {taxRate.rate.toFixed(2)}%
                          </span>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                            Status
                          </p>
                          {getStatusBadge(taxRate.status)}
                        </div>
                      </div>

                      <div className="mt-3 border-t border-gray-100 pt-3">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                          Effective Date
                        </p>
                        <p className="font-medium text-gray-600">
                          {new Date(taxRate.effectiveDate).toLocaleDateString()}
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
                    Agency
                  </TableHead>
                  <TableHead className="h-12 px-4 text-left font-bold text-gray-800">
                    Type
                  </TableHead>
                  <TableHead className="h-12 px-4 text-left font-bold text-gray-800">
                    Rate
                  </TableHead>
                  <TableHead className="h-12 px-4 text-left font-bold text-gray-800">
                    Status
                  </TableHead>
                  <TableHead className="h-12 px-4 text-left font-bold text-gray-800">
                    Effective Date
                  </TableHead>
                  <TableHead className="h-12 w-16 px-4 text-center" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                        <p className="text-lg font-medium text-gray-500">
                          Loading tax rates...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : taxRates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-96 px-6 text-center">
                      <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="rounded-full bg-linear-to-r from-blue-100 to-indigo-100 p-6">
                          <DollarSign className="h-16 w-16 text-blue-600" />
                        </div>
                        <div className="max-w-md space-y-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            No tax rates found
                          </h3>
                          <p className="text-center text-base text-gray-500">
                            {search
                              ? 'No tax rates match your search criteria. Try adjusting your search terms.'
                              : 'Get started by creating your first tax rate to manage your business taxes effectively.'}
                          </p>
                        </div>
                        {!search && (
                          <div className="mt-2">
                            <TaxSheet
                              open={sheetOpen}
                              onOpenChange={setSheetOpen}
                              onSuccess={handleSheetClose}
                            >
                              <Button className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl">
                                <Plus className="mr-2 h-5 w-5" />
                                Create your first tax rate
                              </Button>
                            </TaxSheet>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  taxRates.map((taxRate) => (
                    <TableRow
                      key={taxRate.id}
                      className="group h-16 border-b border-gray-50 transition-all duration-200 hover:bg-blue-50/30"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-base font-bold text-gray-900 transition-colors group-hover:text-blue-700">
                            {taxRate.name}
                          </div>
                          {taxRate.description && (
                            <div className="line-clamp-1 text-sm font-medium text-gray-500">
                              {taxRate.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 font-semibold text-gray-700">
                        {taxRate.agencyName}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        {getTypeBadge(taxRate.type)}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <span className="inline-flex items-center rounded-md border border-green-200 bg-linear-to-r from-green-100 to-emerald-100 px-2 py-1 text-sm font-semibold text-green-800">
                          {taxRate.rate.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        {getStatusBadge(taxRate.status)}
                      </TableCell>
                      <TableCell className="px-4 py-4 font-medium text-gray-600">
                        {new Date(taxRate.effectiveDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center">
                        <DropdownMenu>
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
                              onClick={() => handleEdit(taxRate)}
                              className="mx-2 cursor-pointer rounded-lg px-3 py-2 hover:bg-gray-50"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(taxRate)}
                              className="mx-2 cursor-pointer rounded-lg px-3 py-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Enhanced Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="mx-4 rounded-2xl border-0 shadow-2xl sm:max-w-md">
            <AlertDialogHeader className="space-y-4">
              <AlertDialogTitle className="text-xl font-bold text-gray-900">
                Delete Tax Rate
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4 text-gray-600">
                <p>
                  Are you sure you want to delete "{taxToDelete?.name}"? This
                  action cannot be undone.
                </p>
                {taxToDelete?.isUsed && (
                  <div className="rounded-xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 p-4 text-amber-800">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 shrink-0 text-amber-600" />
                      <span className="text-sm font-semibold">
                        This tax rate is currently being used in documents and
                        cannot be deleted.
                      </span>
                    </div>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 pt-6">
              <AlertDialogCancel
                disabled={isDeleting}
                className="rounded-xl border-gray-300 px-6 py-2"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="rounded-xl bg-linear-to-r from-red-600 to-red-700 px-6 py-2 text-white shadow-lg hover:from-red-700 hover:to-red-800"
                disabled={isDeleting || taxToDelete?.isUsed}
              >
                {isDeleting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
