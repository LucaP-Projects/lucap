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
              <span className="text-gray-600">{formatCurrency(item.amount)}</span>
              <span>{item.paymentMethod.replace(/_/g, ' ')}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {formatDate(item.paymentDate)} {item.reference ? `· ${item.reference}` : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
};
