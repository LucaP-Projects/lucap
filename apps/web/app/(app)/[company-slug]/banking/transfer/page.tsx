'use client';
import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { deleteTransfer, getTransfers } from '@/components/transfer/actions';
import { TransferRecord } from '@/components/transfer/schema';
import { TransferSheet } from '@/components/transfer/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function TransfersPage() {
  const [transfers, setTransfers] = React.useState<TransferRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [trToDelete, setTrToDelete] = React.useState<TransferRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetch = React.useCallback(async () => {
    setLoading(true);
    try { const r = await getTransfers(); if (r.success) setTransfers(r.data || []); } finally { setLoading(false); }
  }, []);

  React.useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async () => {
    if (!trToDelete) return;
    setIsDeleting(true);
    try { const r = await deleteTransfer(trToDelete.id); if (r.success) setTransfers(p => p.filter(t => t.id !== trToDelete.id)); }
    finally { setIsDeleting(false); setDeleteDialogOpen(false); setTrToDelete(null); }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Transfers</h1>
        <p className="text-muted-foreground">Record account-to-account transfers.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>All Transfers</CardTitle><CardDescription>{transfers.length} transfer{transfers.length !== 1 ? 's' : ''} found</CardDescription></div>
            <div><TransferSheet onSuccess={fetch}><Button><Plus className="mr-2 h-4 w-4" />New Transfer</Button></TransferSheet></div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Memo</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
              : transfers.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center">No transfers found.</TableCell></TableRow>
              : transfers.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.transferDate).toLocaleDateString()}</TableCell>
                  <TableCell>{t.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">{t.memo || '—'}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => { setTrToDelete(t); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Transfer</AlertDialogTitle><AlertDialogDescription>Are you sure?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive">{isDeleting ? 'Deleting...' : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
