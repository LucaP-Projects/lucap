'use client';

import * as React from 'react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { deleteCurrency, getCurrencies } from '@/components/company-currency/actions';
import { CompanyCurrencyRecord } from '@/components/company-currency/schema';
import { CompanyCurrencySheet } from '@/components/company-currency/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';

export default function CompanyCurrenciesPage() {
  const [currencies, setCurrencies] = React.useState<CompanyCurrencyRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CompanyCurrencyRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [currencyToDelete, setCurrencyToDelete] = React.useState<CompanyCurrencyRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const fetchCurrencies = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCurrencies(debouncedSearch);
      if (response.success) setCurrencies(response.data || []);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  React.useEffect(() => { fetchCurrencies(); }, [fetchCurrencies]);

  const handleDelete = async () => {
    if (!currencyToDelete) return;
    setIsDeleting(true);
    try {
      const response = await deleteCurrency(currencyToDelete.id);
      if (response.success) setCurrencies((prev) => prev.filter((c) => c.id !== currencyToDelete.id));
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCurrencyToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Currencies</h1>
        <p className="text-muted-foreground">Manage currencies accepted by your company.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Currencies</CardTitle>
              <CardDescription>{currencies.length} currency{currencies.length !== 1 ? 'ies' : ''} found</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input placeholder="Search currencies..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 pl-10" />
              </div>
              <CompanyCurrencySheet open={sheetOpen && !editing} onOpenChange={(o) => { setSheetOpen(o); if (!o) setEditing(null); }} onSuccess={fetchCurrencies}>
                <Button><Plus className="mr-2 h-4 w-4" />Add Currency</Button>
              </CompanyCurrencySheet>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
              ) : currencies.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No currencies found.</TableCell></TableRow>
              ) : currencies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.currency}</TableCell>
                  <TableCell className="text-muted-foreground">{c.name || '—'}</TableCell>
                  <TableCell><Badge variant={c.isDefault ? 'default' : 'secondary'}>{c.isDefault ? 'Default' : 'Additional'}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(c)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { setCurrencyToDelete(c); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CompanyCurrencySheet open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }} currency={editing || undefined} onSuccess={fetchCurrencies} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Currency</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete &ldquo;{currencyToDelete?.currency}&rdquo;? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isDeleting ? 'Deleting...' : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
