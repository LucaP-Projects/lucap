import { Table } from '@tanstack/react-table';

import { formatCurrency, formatDate } from '@/lib/utils';
import { BaseMobileCards } from '../base/mobileCard';
import { PaymentBasic } from './actions';

interface MobileCardsProps {
  table: Table<PaymentBasic>;
  onSelect: (payment: PaymentBasic) => void;
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
        <span className="font-semibold text-emerald-700">
          {formatCurrency(row.original.amount)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-700">Payment Method</span>
        <span className="font-medium">
          {row.original.paymentMethod?.replace(/_/g, ' ') || 'N/A'}
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
          {row.original.paymentDate && formatDate(row.original.paymentDate)}
        </span>
      </div>
    </div>
  );

  return (
    <BaseMobileCards
      table={table}
      onSelect={onSelect}
      onOpenSheet={onOpenSheet}
      renderContent={renderContent}
    />
  );
};
