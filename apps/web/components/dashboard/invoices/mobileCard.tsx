import { Table } from '@tanstack/react-table';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BaseMobileCards } from '../base/mobileCard';
import { InvoiceBasic } from './actions';

interface MobileCardsProps {
  table: Table<InvoiceBasic>;
  onSelect: (invoice: InvoiceBasic) => void;
  onOpenSheet: () => void;
}

export const MobileCards = ({
  table,
  onSelect,
  onOpenSheet
}: MobileCardsProps) => {
  const renderContent = (row: any) => {
    const totalPaid =
      row.original.payments?.reduce(
        (sum: number, payment: { amount: number }) => sum + payment.amount,
        0
      ) || 0;
    const amount = row.original.amount || 0;
    const remainingAmount = amount - totalPaid;

    return (
      <div className="space-y-3 py-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Total Amount</span>
          <span className="font-semibold text-blue-900">
            {formatCurrency(amount)}
          </span>
        </div>
        {totalPaid > 0 && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Paid</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(totalPaid)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Remaining</span>
              <span className="font-semibold text-amber-600">
                {formatCurrency(remainingAmount)}
              </span>
            </div>
          </>
        )}
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Due Date</span>
          <span className="font-medium">
            {formatDate(row.original.dueDate)}
          </span>
        </div>
        {row.original.convertedFromEstimate && row.original.estimate && (
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">From Estimate</span>
            <span className="font-medium text-gray-900">
              #{row.original.estimate.number}
            </span>
          </div>
        )}

        <div className="mt-2 border-t border-gray-200 pt-2">
          <div className="flex items-center">
            <div
              className={`mr-2 h-2.5 w-2.5 rounded-full ${
                row.original.status === 'PAID'
                  ? 'bg-green-500'
                  : row.original.status === 'PARTIAL'
                    ? 'bg-blue-500'
                    : row.original.status === 'OVERDUE'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
              }`}
             />
            <span
              className={`text-xs font-medium ${
                row.original.status === 'PAID'
                  ? 'text-green-600'
                  : row.original.status === 'PARTIAL'
                    ? 'text-blue-600'
                    : row.original.status === 'OVERDUE'
                      ? 'text-red-600'
                      : 'text-yellow-600'
              }`}
            >
              {row.original.status}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderActions = (row: any) => (
    <>
      {row.original.status !== 'PAID' && (
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/record-payment/${row.original.id}`;
          }}
        >
          Record Payment
        </DropdownMenuItem>
      )}

      {row.original.status !== 'CANCELLED' && (
        <>
          {row.original.status !== 'PAID' && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/invoice/${row.original.id}`;
              }}
            >
              Edit Invoice
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/credit-memo/new?invoiceId=${row.original.id}`;
            }}
          >
            Create Credit Memo
          </DropdownMenuItem>
        </>
      )}
    </>
  );

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
