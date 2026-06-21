import { Table } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Badge, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { getStatusColor } from '../base/utils';

// Base interfaces
interface BaseDocument {
  id: string;
  number: string;
  status: string;
  customer?: {
    displayName: string;
  };
}

export interface BaseMobileCardsProps<T extends BaseDocument> {
  table: Table<T>;
  onSelect: (doc: T) => void;
  onOpenSheet: () => void;
}

export interface BaseMobileCardProps<T extends BaseDocument> {
  row: any;
  onSelect: (doc: T) => void;
  onOpenSheet: () => void;
  renderContent: (row: any) => React.ReactNode;
  renderActions?: (row: any) => React.ReactNode;
}

// Base MobileCards container
export const BaseMobileCards = <T extends BaseDocument>({
  table,
  onSelect,
  onOpenSheet,
  renderContent,
  renderActions
}: BaseMobileCardsProps<T> & {
  renderContent: (row: any) => React.ReactNode;
  renderActions?: (row: any) => React.ReactNode;
}) => (
    <div className="space-y-4">
      {table.getRowModel().rows.map((row) => (
        <BaseMobileCard
          key={row.id}
          row={row}
          onSelect={() => onSelect(row.original)}
          onOpenSheet={onOpenSheet}
          renderContent={renderContent}
          renderActions={renderActions}
        />
      ))}
    </div>
  );

// Base MobileCard component
export const BaseMobileCard = <T extends BaseDocument>({
  row,
  onSelect,
  onOpenSheet,
  renderContent,
  renderActions
}: BaseMobileCardProps<T>) => {
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-click-ignore='true']")) return;
    onSelect(row.original);
    onOpenSheet();
  };

  return (
    <div
      className="hover:bg-muted/50 mb-4 cursor-pointer rounded-lg border p-4 shadow"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(row.original);
          onOpenSheet();
        }
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            data-click-ignore="true"
          />
          <span className="font-medium">#{row.getValue('number')}</span>
        </div>
        <Badge className={getStatusColor(row.getValue('status'))}>
          {row.getValue('status').charAt(0) +
            row.getValue('status').slice(1).toLowerCase()}
        </Badge>
      </div>

      {/* Dynamic Content */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Customer</span>
          <span className="font-medium">
            {row.original.customer?.displayName || 'N/A'}
          </span>
        </div>
        {renderContent(row)}
      </div>

      {/* Card Actions */}
      <div className="mt-4 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild data-click-ignore="true">
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(row.original.id);
              }}
            >
              Copy ID
            </DropdownMenuItem>
            {renderActions?.(row)}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

// Helper functions
export const formatCurrency = (amount: number | string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(typeof amount === 'string' ? parseFloat(amount) : amount);

export const formatDate = (date: string | Date) => format(new Date(date), 'PP');
