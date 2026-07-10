'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { deleteTimeActivity, getTimeActivities } from '@/components/time-activity/actions';
import { TimeActivityRecord } from '@/components/time-activity/schema';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function TimeActivityPage() {
  const [activities, setActivities] = React.useState<TimeActivityRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [actToDelete, setActToDelete] = React.useState<TimeActivityRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetch = React.useCallback(async () => {
    setLoading(true);
    try { const r = await getTimeActivities(); if (r.success) setActivities(r.data || []); } finally { setLoading(false); }
  }, []);

  React.useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async () => {
    if (!actToDelete) return;
    setIsDeleting(true);
    try { const r = await deleteTimeActivity(actToDelete.id); if (r.success) setActivities(p => p.filter(a => a.id !== actToDelete.id)); }
    finally { setIsDeleting(false); setDeleteDialogOpen(false); setActToDelete(null); }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Time Activities</h1>
        <p className="text-muted-foreground">Track employee billable hours and time entries.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>All Time Entries</CardTitle><CardDescription>{activities.length} entr{activities.length !== 1 ? 'ies' : 'y'} found</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Duration (hrs)</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Billable</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
              ) : activities.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No time entries found.</TableCell></TableRow>
              ) : activities.map(a => (
                <TableRow key={a.id}>
                  <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                  <TableCell>{a.duration}h</TableCell>
                  <TableCell className="text-muted-foreground">{a.description || '—'}</TableCell>
                  <TableCell><Badge variant={a.billable ? 'default' : 'secondary'}>{a.billable ? 'Billable' : 'Non-billable'}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => { setActToDelete(a); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive">{isDeleting ? 'Deleting...' : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
