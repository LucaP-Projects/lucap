'use client';
import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { deleteAdjustment, getAdjustments } from '@/components/inventory-adjustment/actions';
import { AdjustmentRecord } from '@/components/inventory-adjustment/schema';
import { AdjustmentSheet } from '@/components/inventory-adjustment/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function InventoryAdjustmentsPage() {
  const [adjustments, setAdjustments] = React.useState<AdjustmentRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [adjToDelete, setAdjToDelete] = React.useState<AdjustmentRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetch = React.useCallback(async () => {
    setLoading(true);
    try { const r = await getAdjustments(); if (r.success) setAdjustments(r.data || []); } finally { setLoading(false); }
  }, []);
  React.useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async () => {
    if (!adjToDelete) return;
    setIsDeleting(true);
    try { const r = await deleteAdjustment(adjToDelete.id); if (r.success) setAdjustments(p => p.filter(x => x.id !== adjToDelete.id)); }
    finally { setIsDeleting(false); setDeleteDialogOpen(false); setAdjToDelete(null); }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Adjustments</h1>
        <p className="text-muted-foreground">Record stock adjustments, corrections, and count changes.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>All Adjustments</CardTitle><CardDescription>{adjustments.length} adjustment{adjustments.length !== 1 ? 's' : ''} found</CardDescription></div>
            <div className="flex items-center gap-4">
              <AdjustmentSheet onSuccess={fetch}>
                <Button><Plus className="mr-2 h-4 w-4" />New Adjustment</Button>
              </AdjustmentSheet>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Doc #</TableHead><TableHead>Quantity</TableHead><TableHead>Notes</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
              : adjustments.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center">No adjustments found.</TableCell></TableRow>
              : adjustments.map(a => (
                <TableRow key={a.id}>
                  <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-muted-foreground">{a.docNumber || '—'}</TableCell>
                  <TableCell><Badge variant={a.quantity >= 0 ? 'default' : 'destructive'}>{a.quantity >= 0 ? `+${a.quantity}` : a.quantity}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{a.privateNote || '—'}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => { setAdjToDelete(a); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Adjustment</AlertDialogTitle><AlertDialogDescription>This will revert the quantity change. Are you sure?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive">{isDeleting ? 'Deleting...' : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
