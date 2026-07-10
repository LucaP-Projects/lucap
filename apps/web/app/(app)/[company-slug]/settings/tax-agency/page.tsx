'use client';

import * as React from 'react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { deleteTaxAgency, getTaxAgencies } from '@/components/tax-agency/actions';
import { TaxAgencyRecord } from '@/components/tax-agency/schema';
import { TaxAgencySheet } from '@/components/tax-agency/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';

export default function TaxAgenciesPage() {
  const [agencies, setAgencies] = React.useState<TaxAgencyRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TaxAgencyRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [agencyToDelete, setAgencyToDelete] = React.useState<TaxAgencyRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const fetchAgencies = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getTaxAgencies(debouncedSearch);
      if (response.success) setAgencies(response.data || []);
    } finally { setLoading(false); }
  }, [debouncedSearch]);

  React.useEffect(() => { fetchAgencies(); }, [fetchAgencies]);

  const handleDelete = async () => {
    if (!agencyToDelete) return;
    setIsDeleting(true);
    try {
      const response = await deleteTaxAgency(agencyToDelete.id);
      if (response.success) setAgencies((prev) => prev.filter((a) => a.id !== agencyToDelete.id));
    } finally {
      setIsDeleting(false); setDeleteDialogOpen(false); setAgencyToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Tax Agencies</h1>
        <p className="text-muted-foreground">Manage tax agencies that collect taxes (e.g. Ministere des Finances).</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Tax Agencies</CardTitle>
              <CardDescription>{agencies.length} agenc{agencies.length !== 1 ? 'ies' : 'y'} found</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input placeholder="Search agencies..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 pl-10" />
              </div>
              <TaxAgencySheet open={sheetOpen && !editing} onOpenChange={(o) => { setSheetOpen(o); if (!o) setEditing(null); }} onSuccess={fetchAgencies}>
                <Button><Plus className="mr-2 h-4 w-4" />Add Agency</Button>
              </TaxAgencySheet>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Registration #</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Purchases</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
              ) : agencies.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No tax agencies found.</TableCell></TableRow>
              ) : agencies.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell className="text-muted-foreground">{a.registrationNumber || '—'}</TableCell>
                  <TableCell><Badge variant={a.taxTrackedOnSales ? 'default' : 'secondary'}>{a.taxTrackedOnSales ? 'Yes' : 'No'}</Badge></TableCell>
                  <TableCell><Badge variant={a.taxTrackedOnPurchases ? 'default' : 'secondary'}>{a.taxTrackedOnPurchases ? 'Yes' : 'No'}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(a)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { setAgencyToDelete(a); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <TaxAgencySheet open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }} agency={editing || undefined} onSuccess={fetchAgencies} />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tax Agency</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete &ldquo;{agencyToDelete?.name}&rdquo;? This action cannot be undone.</AlertDialogDescription>
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
