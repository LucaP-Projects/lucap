import { Table } from '@tanstack/react-table';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { getDocumentQualificationStatus } from '@/lib/document-qualification';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BaseMobileCards } from '../base/mobileCard';
import { CreditMemoBasic } from './actions';

interface MobileCardsProps {
  table: Table<CreditMemoBasic>;
  onSelect: (creditMemo: CreditMemoBasic) => void;
  onOpenSheet: () => void;
}

export const MobileCards = ({
  table,
  onSelect,
  onOpenSheet
}: MobileCardsProps) => {
  const renderContent = (row: any) => {
    const qualificationStatus = getDocumentQualificationStatus(row.original.notes);
    return (
    <div className="space-y-3 py-1">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-700">Amount</span>
        <span className="font-semibold text-green-700">
          {formatCurrency(row.original.amount)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-700">Issue Date</span>
        <span className="font-medium">
          {formatDate(row.original.issueDate)}
        </span>
      </div>
      {row.original.originalInvoiceId && row.original.originalInvoice && (
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Original Invoice</span>
          <span className="font-medium text-blue-700">
            #{row.original.originalInvoice.number}
          </span>
        </div>
      )}

      <div className="mt-2 border-t border-gray-200 pt-2">
        <div className="flex items-center">
          <div
            className={`mr-2 h-2.5 w-2.5 rounded-full ${
              qualificationStatus === 'VALIDATED'
                ? 'bg-green-500'
                : qualificationStatus === 'REJECTED'
                  ? 'bg-red-500'
                  : 'bg-gray-400'
            }`}
           />
          <span
            className={`text-xs font-medium ${
              qualificationStatus === 'VALIDATED'
                ? 'text-green-600'
                : qualificationStatus === 'REJECTED'
                  ? 'text-red-600'
                  : 'text-gray-500'
            }`}
          >
            {qualificationStatus ?? 'Not reviewed'}
          </span>
        </div>
      </div>
    </div>
    );
  };

  const renderActions = (row: any) => {
    if (row.original.status !== 'VOID' && row.original.status !== 'APPLIED') {
      return (
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/credit-memo/${row.original.id}`;
          }}
        >
          Edit Credit Memo
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
