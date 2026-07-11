import { formatCurrency, formatDate } from '@/lib/utils';

export const MobileCards = ({ table, onSelect, onOpenSheet }: any) => {
  const rows = table?.getRowModel?.()?.rows || [];
  if (!rows.length) return null;

  return (
    <div className="space-y-4 md:hidden">
      {rows.map((row: any) => {
        const item = row.original;
        return (
          <div key={item.id} className="rounded-lg border p-4 cursor-pointer hover:bg-gray-50" onClick={() => onSelect(item)}>
            <div className="font-medium">{item.vendor?.displayName || 'Vendor'}</div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-600">{item.number}</span>
              <span className="font-semibold">{formatCurrency(item.amount)}</span>
            </div>
            <div className="flex justify-between mt-1 text-sm text-gray-500">
              <span>Date: {formatDate(item.txnDate)}</span>
              <span>{item.status.replace(/_/g, ' ')}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};