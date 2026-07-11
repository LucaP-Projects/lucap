'use client';

import * as React from 'react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { deleteTerm, getTerms } from '@/components/term/actions';
import { TermRecord } from '@/components/term/schema';
import { TermSheet } from '@/components/term/sheet';
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

export default function TermsPage() {
  const [terms, setTerms] = React.useState<TermRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TermRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [termToDelete, setTermToDelete] = React.useState<TermRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const fetchTerms = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getTerms(debouncedSearch);
      if (response.success) setTerms(response.data || []);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  React.useEffect(() => { fetchTerms(); }, [fetchTerms]);

  const handleDelete = async () => {
    if (!termToDelete) return;
    setIsDeleting(true);
    try {
      const response = await deleteTerm(termToDelete.id);
      if (response.success) setTerms((prev) => prev.filter((t) => t.id !== termToDelete.id));
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setTermToDelete(null);
    }
  };

  const formatTerm = (t: TermRecord) => {
    if (t.discountPercent && t.discountDays) {
      return `${t.discountPercent}% ${t.discountDays} Net ${t.dueDays || 'N/A'}`;
    }
    if (t.dueDays) return `Net ${t.dueDays}`;
    return t.name;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Payment Terms</h1>
        <p className="text-muted-foreground">Manage payment terms like Net 30, 2% 15 Net 60, etc.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Terms</CardTitle>
              <CardDescription>{terms.length} term{terms.length !== 1 ? 's' : ''} found</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input placeholder="Search terms..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 pl-10" />
              </div>
              <TermSheet open={sheetOpen && !editing} onOpenChange={(o) => { setSheetOpen(o); if (!o) setEditing(null); }} onSuccess={fetchTerms}>
                <Button><Plus className="mr-2 h-4 w-4" />Add Term</Button>
              </TermSheet>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Terms</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
              ) : terms.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No payment terms found.</TableCell></TableRow>
              ) : terms.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-muted-foreground">{formatTerm(t)}</TableCell>
                  <TableCell>{t.discountPercent ? `${t.discountPercent}%` : '—'}</TableCell>
                  <TableCell><Badge variant={t.active ? 'default' : 'secondary'}>{t.active ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(t)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { setTermToDelete(t); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TermSheet open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }} term={editing || undefined} onSuccess={fetchTerms} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Term</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete &ldquo;{termToDelete?.name}&rdquo;? This action cannot be undone.</AlertDialogDescription>
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
