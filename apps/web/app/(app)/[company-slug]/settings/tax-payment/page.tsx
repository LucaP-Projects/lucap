'use client';
import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { deleteTaxPayment, getTaxPayments } from '@/components/tax-payment/actions';
import { TaxPaymentRecord } from '@/components/tax-payment/schema';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function TaxPaymentsPage() {
  const [payments, setPayments] = React.useState<TaxPaymentRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [payToDelete, setPayToDelete] = React.useState<TaxPaymentRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetch = React.useCallback(async () => {
    setLoading(true);
    try { const r = await getTaxPayments(); if (r.success) setPayments(r.data || []); } finally { setLoading(false); }
  }, []);
  React.useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async () => {
    if (!payToDelete) return;
    setIsDeleting(true);
    try { const r = await deleteTaxPayment(payToDelete.id); if (r.success) setPayments(p => p.filter(x => x.id !== payToDelete.id)); }
    finally { setIsDeleting(false); setDeleteDialogOpen(false); setPayToDelete(null); }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Tax Payments</h1>
        <p className="text-muted-foreground">Track tax payments made to tax agencies.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>All Tax Payments</CardTitle><CardDescription>{payments.length} payment{payments.length !== 1 ? 's' : ''} found</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Reference</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
              : payments.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center">No payments found.</TableCell></TableRow>
              : payments.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{new Date(p.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell>{p.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">{p.reference || '—'}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => { setPayToDelete(p); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Tax Payment</AlertDialogTitle><AlertDialogDescription>Are you sure?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive">{isDeleting ? 'Deleting...' : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
