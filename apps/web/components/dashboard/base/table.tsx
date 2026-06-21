'use client';
import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext
} from '@/components/ui/pagination';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell,  } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';


import { BatchActions } from './BatchActions';

export interface DeleteResult {
  success: boolean;
  error?: string;
}

// More flexible interface that allows any shape of data
interface DataTableProps<TBasic, TDetailed> {
  columns: ColumnDef<TBasic, any>[];
  data: TBasic[];
  pageCount: number;
  initialPage?: number;
  onPageChange: (page: number) => void;
  onDeleteSelected: (selectedRows: string[]) => Promise<DeleteResult>;
  getDetails: (id: string) => Promise<TDetailed | null>;
  MobileCards: React.ComponentType<{
    table: any;
    onSelect: (item: TBasic) => void;
    onOpenSheet: () => void;
  }>;
  // Use type assertion to allow any shape of data
  DetailSheet: React.ComponentType<any>;
}

export function DataTable<TBasic extends { id: string }, TDetailed>({
  columns,
  data,
  pageCount,
  initialPage = 1,
  onPageChange,
  onDeleteSelected,
  getDetails,
  MobileCards,
  DetailSheet
}: DataTableProps<TBasic, TDetailed>) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const isMobile = useIsMobile();
  const [selectedItem, setSelectedItem] = useState<TDetailed | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = async (item: TBasic) => {
    setIsLoading(true);
    try {
      const details = await getDetails(item.id);
      if (details) {
        setSelectedItem(details);
        setIsSheetOpen(true);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load details',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection
    },
    manualPagination: true,
    pageCount
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleDelete = async () => {
    if (onDeleteSelected && selectedRows.length > 0) {
      try {
        setIsDeleting(true);
        const selectedIds = selectedRows.map((row) => row.original.id);
        const result = await onDeleteSelected(selectedIds);

        if (result.success) {
          toast({
            title: 'Success',
            description: `Successfully deleted ${selectedIds.length} item${selectedIds.length === 1 ? '' : 's'}`
          });
          setRowSelection({});
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to delete items',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to delete items',
          variant: 'destructive'
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handlePageChange = (page: number) => {
    onPageChange(page);
  };

  return (
    <div className="space-y-4">
      <BatchActions
        selectedCount={selectedRows.length}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />

      {isMobile ? (
        <div className="space-y-4">
          <MobileCards
            table={table}
            onSelect={handleSelect}
            onOpenSheet={() => setIsSheetOpen(true)}
          />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => handleSelect(row.original)}
                    className="hover:bg-muted/50 cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="overflow-x-auto">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (initialPage > 1) handlePageChange(initialPage - 1);
                }}
              />
            </PaginationItem>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
              <PaginationItem
                key={page}
                className={isMobile && page > 3 ? 'hidden md:block' : ''}
              >
                <PaginationLink
                  href="#"
                  isActive={page === initialPage}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (initialPage < pageCount)
                    handlePageChange(initialPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {selectedItem && (
        <DetailSheet
          data={selectedItem}
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
