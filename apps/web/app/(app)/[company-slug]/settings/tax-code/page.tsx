'use client';

import * as React from 'react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { deleteTaxCode, getTaxCodes } from '@/components/tax-code/actions';
import { TaxCodeRecord } from '@/components/tax-code/schema';
import { TaxCodeSheet } from '@/components/tax-code/sheet';
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

export default function TaxCodesPage() {
  const [codes, setCodes] = React.useState<TaxCodeRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TaxCodeRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [codeToDelete, setCodeToDelete] = React.useState<TaxCodeRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const fetchCodes = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getTaxCodes(debouncedSearch);
      if (response.success) setCodes(response.data || []);
    } finally { setLoading(false); }
  }, [debouncedSearch]);

  React.useEffect(() => { fetchCodes(); }, [fetchCodes]);

  const handleDelete = async () => {
    if (!codeToDelete) return;
    setIsDeleting(true);
    try {
      const response = await deleteTaxCode(codeToDelete.id);
      if (response.success) setCodes((prev) => prev.filter((c) => c.id !== codeToDelete.id));
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCodeToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Tax Codes</h1>
        <p className="text-muted-foreground">Manage tax codes for grouping tax rates (e.g. TVA 19%, EXEMPT).</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Tax Codes</CardTitle>
              <CardDescription>{codes.length} code{codes.length !== 1 ? 's' : ''} found</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input placeholder="Search tax codes..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 pl-10" />
              </div>
              <TaxCodeSheet open={sheetOpen && !editing} onOpenChange={(o) => { setSheetOpen(o); if (!o) setEditing(null); }} onSuccess={fetchCodes}>
                <Button><Plus className="mr-2 h-4 w-4" />Add Tax Code</Button>
              </TaxCodeSheet>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Taxable</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
              ) : codes.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No tax codes found.</TableCell></TableRow>
              ) : codes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell><Badge variant={c.taxable ? 'default' : 'secondary'}>{c.taxable ? 'Taxable' : 'Non-Taxable'}</Badge></TableCell>
                  <TableCell><Badge variant={c.active ? 'default' : 'secondary'}>{c.active ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(c)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { setCodeToDelete(c); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <TaxCodeSheet open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }} taxCode={editing || undefined} onSuccess={fetchCodes} />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tax Code</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete &ldquo;{codeToDelete?.name}&rdquo;? This action cannot be undone.</AlertDialogDescription>
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
