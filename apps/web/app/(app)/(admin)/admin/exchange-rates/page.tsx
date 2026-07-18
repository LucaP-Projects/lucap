'use client';

import * as React from 'react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { deleteExchangeRate, getExchangeRates } from '@/components/exchange-rate/actions';
import { ExchangeRateRecord } from '@/components/exchange-rate/schema';
import { ExchangeRateSheet } from '@/components/exchange-rate/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';

export default function ExchangeRatesPage() {
  const [rates, setRates] = React.useState<ExchangeRateRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ExchangeRateRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [rateToDelete, setRateToDelete] = React.useState<ExchangeRateRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const fetchRates = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getExchangeRates(debouncedSearch);
      if (response.success) setRates(response.data || []);
    } finally { setLoading(false); }
  }, [debouncedSearch]);

  React.useEffect(() => { fetchRates(); }, [fetchRates]);

  const handleDelete = async () => {
    if (!rateToDelete) return;
    setIsDeleting(true);
    try {
      const response = await deleteExchangeRate(rateToDelete.id);
      if (response.success) setRates((prev) => prev.filter((r) => r.id !== rateToDelete.id));
    } finally {
      setIsDeleting(false); setDeleteDialogOpen(false); setRateToDelete(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exchange Rates</h1>
        <p className="mt-1 text-muted-foreground">Manage global exchange rates used across all companies.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Exchange Rates</CardTitle>
              <CardDescription>{rates.length} rate{rates.length !== 1 ? 's' : ''} found</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input placeholder="Search by currency..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 pl-10" />
              </div>
              <ExchangeRateSheet open={sheetOpen && !editing} onOpenChange={(o) => { setSheetOpen(o); if (!o) setEditing(null); }} onSuccess={fetchRates}>
                <Button><Plus className="mr-2 h-4 w-4" />Add Rate</Button>
              </ExchangeRateSheet>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
              ) : rates.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No exchange rates found.</TableCell></TableRow>
              ) : rates.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.sourceCurrency}</TableCell>
                  <TableCell>{r.targetCurrency}</TableCell>
                  <TableCell>{r.rate.toFixed(4)}</TableCell>
                  <TableCell>{new Date(r.asOfDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-muted-foreground">{r.source}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(r)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { setRateToDelete(r); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ExchangeRateSheet open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }} rate={editing || undefined} onSuccess={fetchRates} />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exchange Rate</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this rate ({rateToDelete?.sourceCurrency} → {rateToDelete?.targetCurrency})? This action cannot be undone.</AlertDialogDescription>
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
