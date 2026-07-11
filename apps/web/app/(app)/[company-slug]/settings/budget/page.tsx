'use client';

import * as React from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { deleteBudget, getBudgets } from '@/components/budget/actions';
import { BudgetRecord } from '@/components/budget/schema';
import { BudgetSheet } from '@/components/budget/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';

export default function BudgetsPage() {
  const [budgets, setBudgets] = React.useState<BudgetRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [budgetToDelete, setBudgetToDelete] = React.useState<BudgetRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const fetchBudgets = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getBudgets();
      if (response.success) {
        let data = response.data || [];
        if (debouncedSearch) data = data.filter(b => b.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
        setBudgets(data);
      }
    } finally { setLoading(false); }
  }, [debouncedSearch]);

  React.useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const handleDelete = async () => {
    if (!budgetToDelete) return;
    setIsDeleting(true);
    try {
      const response = await deleteBudget(budgetToDelete.id);
      if (response.success) setBudgets((prev) => prev.filter((b) => b.id !== budgetToDelete.id));
    } finally { setIsDeleting(false); setDeleteDialogOpen(false); setBudgetToDelete(null); }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
        <p className="text-muted-foreground">Create and manage budgets with account-level entries.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Budgets</CardTitle>
              <CardDescription>{budgets.length} budget{budgets.length !== 1 ? 's' : ''} found</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input placeholder="Search budgets..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 pl-10" />
              </div>
              <BudgetSheet open={sheetOpen} onOpenChange={setSheetOpen} onSuccess={fetchBudgets}>
                <Button><Plus className="mr-2 h-4 w-4" />Create Budget</Button>
              </BudgetSheet>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Fiscal Year</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
              ) : budgets.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No budgets found.</TableCell></TableRow>
              ) : budgets.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell>{b.fiscalYear}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => { setBudgetToDelete(b); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete &ldquo;{budgetToDelete?.name}&rdquo;? This action cannot be undone.</AlertDialogDescription>
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
