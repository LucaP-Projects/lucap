import { Table } from '@tanstack/react-table';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BaseMobileCards } from '../base/mobileCard';
import { RefundReceiptBasic } from './actions';

interface MobileCardsProps {
  table: Table<RefundReceiptBasic>;
  onSelect: (refund: RefundReceiptBasic) => void;
  onOpenSheet: () => void;
}

export const MobileCards = ({
  table,
  onSelect,
  onOpenSheet
}: MobileCardsProps) => {
  const formatReason = (reason: string) =>
    reason
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

  const renderContent = (row: any) => (
      <div className="space-y-3 py-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Amount</span>
          <span className="font-semibold text-violet-700">
            {formatCurrency(row.original.amount)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Refund Method</span>
          <span className="font-medium">
            {row.original.refundMethod?.replace(/_/g, ' ') || 'N/A'}
          </span>
        </div>
        {row.original.originalPaymentMethod && (
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Original Payment</span>
            <span className="font-medium text-gray-900">
              {row.original.originalPaymentMethod.replace(/_/g, ' ')}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Reason</span>
          <span className="font-medium text-gray-900">
            {row.original.reason ? formatReason(row.original.reason) : 'N/A'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Customer</span>
          <span className="font-medium text-gray-900">
            {row.original.customer?.displayName || 'N/A'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Date</span>
          <span className="font-medium">
            {row.original.createdAt && formatDate(row.original.createdAt)}
          </span>
        </div>

        <div className="mt-2 border-t border-gray-200 pt-2">
          <div className="flex items-center">
            <div
              className={`mr-2 h-2.5 w-2.5 rounded-full ${
                row.original.status === 'PENDING'
                  ? 'bg-amber-500'
                  : row.original.status === 'PROCESSED'
                    ? 'bg-green-500'
                    : 'bg-red-500'
              }`}
             />
            <span
              className={`text-xs font-medium ${
                row.original.status === 'PENDING'
                  ? 'text-amber-600'
                  : row.original.status === 'PROCESSED'
                    ? 'text-green-600'
                    : 'text-red-600'
              }`}
            >
              {row.original.status}
            </span>
          </div>
        </div>
      </div>
    );

  const renderActions = (row: any) => {
    if (row.original.status === 'PENDING') {
      return (
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/refund/${row.original.id}`;
          }}
        >
          Process Refund
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
