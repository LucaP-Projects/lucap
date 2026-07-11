'use client';
import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { deleteDeposit, getDeposits } from '@/components/deposit/actions';
import { DepositRecord } from '@/components/deposit/schema';
import { DepositSheet } from '@/components/deposit/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function DepositsPage() {
  const [deposits, setDeposits] = React.useState<DepositRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [depToDelete, setDepToDelete] = React.useState<DepositRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetch = React.useCallback(async () => {
    setLoading(true);
    try { const r = await getDeposits(); if (r.success) setDeposits(r.data || []); } finally { setLoading(false); }
  }, []);

  React.useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async () => {
    if (!depToDelete) return;
    setIsDeleting(true);
    try { const r = await deleteDeposit(depToDelete.id); if (r.success) setDeposits(p => p.filter(d => d.id !== depToDelete.id)); }
    finally { setIsDeleting(false); setDeleteDialogOpen(false); setDepToDelete(null); }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Deposits</h1>
        <p className="text-muted-foreground">Record bank deposits and deposit slips.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>All Deposits</CardTitle><CardDescription>{deposits.length} deposit{deposits.length !== 1 ? 's' : ''} found</CardDescription></div>
            <div><DepositSheet onSuccess={fetch}><Button><Plus className="mr-2 h-4 w-4" />New Deposit</Button></DepositSheet></div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Memo</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
              : deposits.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center">No deposits found.</TableCell></TableRow>
              : deposits.map(d => (
                <TableRow key={d.id}>
                  <TableCell>{new Date(d.depositDate).toLocaleDateString()}</TableCell>
                  <TableCell>{d.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">{d.memo || '—'}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => { setDepToDelete(d); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Deposit</AlertDialogTitle><AlertDialogDescription>Are you sure?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive">{isDeleting ? 'Deleting...' : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
