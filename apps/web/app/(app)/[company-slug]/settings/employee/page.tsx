'use client';

import * as React from 'react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { deleteEmployee, getEmployees } from '@/components/employee/actions';
import { EmployeeRecord } from '@/components/employee/schema';
import { EmployeeSheet } from '@/components/employee/sheet';
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

export default function EmployeesPage() {
  const [employees, setEmployees] = React.useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EmployeeRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [empToDelete, setEmpToDelete] = React.useState<EmployeeRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const fetch = React.useCallback(async () => {
    setLoading(true);
    try { const r = await getEmployees(debouncedSearch); if (r.success) setEmployees(r.data || []); } finally { setLoading(false); }
  }, [debouncedSearch]);

  React.useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async () => {
    if (!empToDelete) return;
    setIsDeleting(true);
    try { const r = await deleteEmployee(empToDelete.id); if (r.success) setEmployees(p => p.filter(e => e.id !== empToDelete.id)); }
    finally { setIsDeleting(false); setDeleteDialogOpen(false); setEmpToDelete(null); }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
        <p className="text-muted-foreground">Manage employee records and billable time tracking.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>All Employees</CardTitle><CardDescription>{employees.length} employee{employees.length !== 1 ? 's' : ''} found</CardDescription></div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} className="w-64 pl-10" />
              </div>
              <EmployeeSheet open={sheetOpen && !editing} onOpenChange={o => { setSheetOpen(o); if (!o) setEditing(null); }} onSuccess={fetch}>
                <Button><Plus className="mr-2 h-4 w-4" />Add Employee</Button>
              </EmployeeSheet>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Employee #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
              ) : employees.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No employees found.</TableCell></TableRow>
              ) : employees.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.displayName}</TableCell>
                  <TableCell className="text-muted-foreground">{e.title || '—'}</TableCell>
                  <TableCell>{e.primaryEmail || '—'}</TableCell>
                  <TableCell>{e.employeeNumber || '—'}</TableCell>
                  <TableCell><Badge variant={e.isActive ? 'default' : 'secondary'}>{e.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(e)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { setEmpToDelete(e); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <EmployeeSheet open={!!editing} onOpenChange={o => { if (!o) setEditing(null); }} employee={editing || undefined} onSuccess={fetch} />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete &ldquo;{empToDelete?.displayName}&rdquo;?</AlertDialogDescription>
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
