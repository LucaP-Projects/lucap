'use client';

import * as React from 'react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { deleteCustomerType, getCustomerTypes } from '@/components/customer-type/actions';
import { CustomerTypeRecord } from '@/components/customer-type/schema';
import { CustomerTypeSheet } from '@/components/customer-type/sheet';
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

export default function CustomerTypesPage() {
  const [types, setTypes] = React.useState<CustomerTypeRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CustomerTypeRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [typeToDelete, setTypeToDelete] = React.useState<CustomerTypeRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const fetchTypes = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCustomerTypes(debouncedSearch);
      if (response.success) setTypes(response.data || []);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  React.useEffect(() => { fetchTypes(); }, [fetchTypes]);

  const handleDelete = async () => {
    if (!typeToDelete) return;
    setIsDeleting(true);
    try {
      const response = await deleteCustomerType(typeToDelete.id);
      if (response.success) {
        setTypes((prev) => prev.filter((t) => t.id !== typeToDelete.id));
      }
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setTypeToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Customer Types</h1>
        <p className="text-muted-foreground">Categorize customers in ways meaningful to your business.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Customer Types</CardTitle>
              <CardDescription>{types.length} type{types.length !== 1 ? 's' : ''} found</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input placeholder="Search types..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 pl-10" />
              </div>
              <CustomerTypeSheet open={sheetOpen && !editing} onOpenChange={(o) => { setSheetOpen(o); if (!o) setEditing(null); }} onSuccess={fetchTypes}>
                <Button><Plus className="mr-2 h-4 w-4" />Add Customer Type</Button>
              </CustomerTypeSheet>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
              ) : types.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No customer types found.</TableCell></TableRow>
              ) : types.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell><Badge variant={t.active ? 'default' : 'secondary'}>{t.active ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(t)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { setTypeToDelete(t); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CustomerTypeSheet open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }} customerType={editing || undefined} onSuccess={fetchTypes} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer Type</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete &ldquo;{typeToDelete?.name}&rdquo;? This action cannot be undone.</AlertDialogDescription>
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
