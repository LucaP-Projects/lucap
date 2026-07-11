'use client';

import * as React from 'react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { deleteClass, getClasses } from '@/components/class/actions';
import { ClassRecord } from '@/components/class/schema';
import { ClassSheet } from '@/components/class/sheet';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';

export default function ClassesPage() {
  const [classes, setClasses] = React.useState<ClassRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingClass, setEditingClass] = React.useState<ClassRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [classToDelete, setClassToDelete] = React.useState<ClassRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const fetchClasses = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getClasses(debouncedSearch);
      if (response.success) {
        setClasses(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  React.useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleDelete = async () => {
    if (!classToDelete) return;
    setIsDeleting(true);
    try {
      const response = await deleteClass(classToDelete.id);
      if (response.success) {
        setClasses((prev) => prev.filter((c) => c.id !== classToDelete.id));
      } else {
        console.error('Error deleting class:', response.error);
      }
    } catch (error) {
      console.error('Error deleting class:', error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setClassToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
        <p className="text-muted-foreground">
          Manage classes to track transactions by category for reporting and analysis.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Classes</CardTitle>
              <CardDescription>
                {classes.length} {`class${classes.length !== 1 ? 'es' : ''}`} found
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search classes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>
              <ClassSheet
                open={sheetOpen && !editingClass}
                onOpenChange={(open) => {
                  setSheetOpen(open);
                  if (!open) setEditingClass(null);
                }}
                onSuccess={fetchClasses}
              >
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Class
                </Button>
              </ClassSheet>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No classes found. Create your first class to get started.
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {cls.parent?.name || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cls.active ? 'default' : 'secondary'}>
                        {cls.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingClass(cls)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setClassToDelete(cls);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ClassSheet
        open={!!editingClass}
        onOpenChange={(open) => {
          if (!open) setEditingClass(null);
        }}
        classRecord={editingClass || undefined}
        onSuccess={fetchClasses}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{classToDelete?.name}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
