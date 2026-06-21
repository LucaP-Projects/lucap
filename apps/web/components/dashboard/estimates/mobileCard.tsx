import { Table } from '@tanstack/react-table';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BaseMobileCards } from '../base/mobileCard';
import { EstimateBasic } from './actions';

interface MobileCardsProps {
  table: Table<EstimateBasic>;
  onSelect: (estimate: EstimateBasic) => void;
  onOpenSheet: () => void;
}

export const MobileCards = ({
  table,
  onSelect,
  onOpenSheet
}: MobileCardsProps) => {
  const renderContent = (row: any) => (
      <div className="space-y-3 py-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Amount</span>
          <span className="font-semibold text-pink-700">
            {formatCurrency(row.original.amount)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Tax Amount</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(row.original.taxAmount)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Discount</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(row.original.discountAmount)} (
            {row.original.discountValue}%)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Due Date</span>
          <span className="font-medium">
            {row.original.dueDate && formatDate(row.original.dueDate)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Customer</span>
          <span className="font-medium text-gray-900">
            {row.original.customer?.displayName || 'N/A'}
          </span>
        </div>

        <div className="mt-2 border-t border-gray-200 pt-2">
          <div className="flex items-center">
            <div
              className={`mr-2 h-2.5 w-2.5 rounded-full ${
                row.original.status === 'ACCEPTED'
                  ? 'bg-green-500'
                  : row.original.status === 'REJECTED'
                    ? 'bg-red-500'
                    : row.original.status === 'CONVERTED'
                      ? 'bg-blue-500'
                      : row.original.status === 'SENT'
                        ? 'bg-indigo-500'
                        : 'bg-yellow-500'
              }`}
             />
            <span
              className={`text-xs font-medium ${
                row.original.status === 'ACCEPTED'
                  ? 'text-green-600'
                  : row.original.status === 'REJECTED'
                    ? 'text-red-600'
                    : row.original.status === 'CONVERTED'
                      ? 'text-blue-600'
                      : row.original.status === 'SENT'
                        ? 'text-indigo-600'
                        : 'text-yellow-600'
              }`}
            >
              {row.original.status}
            </span>
          </div>
        </div>
      </div>
    );

  const renderActions = (row: any) => {
    if (row.original.status !== 'CONVERTED') {
      return (
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/estimate/${row.original.id}`;
          }}
        >
          Edit Estimate
        </DropdownMenuItem>
      );
    }
    return null;
  };

  return (
    <BaseMobileCards
      table={table}
      onSelect={onSelect}
      onOpenSheet={onOpenSheet}
      renderContent={renderContent}
      renderActions={renderActions}
    />
  );
};
