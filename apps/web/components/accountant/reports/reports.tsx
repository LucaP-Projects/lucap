'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Table } from 'lucide-react';

import { toast } from 'sonner';
import Loading from '@/components/shared/loading';
import { deleteJournal, fetchJournals } from './actions';
import type { DateRange, JournalEntry, PaginationData } from './types';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DateRangePicker } from '@/components/ui/date-range-picker';

export function EnhancedJournalTable() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<JournalEntry[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJournalId, setSelectedJournalId] = useState<string | null>(
    null
  );
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  const loadJournals = async () => {
    setIsLoading(true);
    try {
      const response = await fetchJournals({
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        page: pagination.page,
        limit: pagination.limit
      });

      if (response.success && response.data) {
        setData(response.data.journals);
        setPagination(response.data.pagination);
      } else {
        toast.error(response.error || 'Failed to load journals');
      }
    } catch (error) {
      toast.error('Failed to load journals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateDelete = (id: string) => {
    setSelectedJournalId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedJournalId) return;

    try {
      const response = await deleteJournal(selectedJournalId);
      if (response.success) {
        toast.success('Journal entry deleted successfully');
        loadJournals();
      } else {
        toast.error(response.error || 'Failed to delete journal');
      }
    } catch (error) {
      toast.error('Failed to delete journal');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedJournalId(null);
    }
  };

  const handleDateRangeUpdate = ({
    range
  }: {
    range: { from: Date; to?: Date };
  }) => {
    setDateRange({
      from: range.from,
      to: range.to ?? range.from // Default to 'from' date if 'to' is undefined
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  useEffect(() => {
    loadJournals();
  }, [dateRange, pagination.page, pagination.limit]);

  const formatAmount = (amount: number | null) =>
    amount?.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) || '-';

  // Calculate grand totals
  const grandTotals = data.reduce(
    (totals, journal) => {
      const journalTotals = journal.entries.reduce(
        (sum, entry) => ({
          debit: sum.debit + (entry.debit || 0),
          credit: sum.credit + (entry.credit || 0)
        }),
        { debit: 0, credit: 0 }
      );

      return {
        debit: totals.debit + journalTotals.debit,
        credit: totals.credit + journalTotals.credit
      };
    },
    { debit: 0, credit: 0 }
  );
  const handleEdit = (journalId: string) => {
    router.push(`/journal/${journalId}`);
  };
  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loading />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-3xl font-semibold tracking-tight">
              Journal Entries
            </h2>

            <div className="flex flex-1 flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-end">
              <DateRangePicker
                initialDateFrom={dateRange.from}
                initialDateTo={dateRange.to}
                onUpdate={handleDateRangeUpdate}
                align="end"
                showCompare={false}
              />

              <Link href="/journal">
                <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  Create Journal
                </Button>
              </Link>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Memo/Description</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="w-12.5"/>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((journal) => {
                  const entryTotals = journal.entries.reduce(
                    (sum, entry) => ({
                      debit: sum.debit + (entry.debit || 0),
                      credit: sum.credit + (entry.credit || 0)
                    }),
                    { debit: 0, credit: 0 }
                  );

                  return (
                    <React.Fragment key={journal.id}>
                      {/* Journal Header */}
                      <TableRow className="bg-muted/5">
                        <TableCell>
                          {new Date(journal.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{journal.transactionType}</TableCell>
                        <TableCell>
                          {journal.customer?.displayName || '-'}
                        </TableCell>
                        <TableCell>{journal.description || '-'}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell className="text-right tabular-nums">
                          -
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          -
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEdit(journal.id)}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleInitiateDelete(journal.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      {/* Journal Entries */}
                      {journal.entries.map((entry) => (
                        <TableRow key={entry.id} className="bg-muted/10">
                          <TableCell />
                          <TableCell />
                          <TableCell />
                          <TableCell>{entry.description || '-'}</TableCell>
                          <TableCell>
                            {entry.account.title}
                            <span className="text-muted-foreground ml-2 text-xs">
                              ({entry.account.number})
                            </span>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatAmount(entry.debit)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatAmount(entry.credit)}
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      ))}
                      {/* Entry Total */}
                      <TableRow className="border-primary/20 bg-muted/20 border-t font-medium">
                        <TableCell colSpan={5} className="text-right">
                          Entry Total
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatAmount(entryTotals.debit)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatAmount(entryTotals.credit)}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </React.Fragment>
                  );
                })}
                {/* Grand Total */}
                <TableRow className="border-t-2 font-medium">
                  <TableCell colSpan={5} className="text-right">
                    TOTAL
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(grandTotals.debit)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(grandTotals.credit)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              {pagination && (
                <>
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{' '}
                  of {pagination.total} entries
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page >= pagination.pages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              journal entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
