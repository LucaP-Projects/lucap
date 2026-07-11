import { formatCurrency } from '@/lib/utils';

export const MobileCards = ({ table, onSelect, onOpenSheet }: any) => {
  const rows = table?.getRowModel?.()?.rows || [];
  if (!rows.length) return null;

  return (
    <div className="space-y-4 md:hidden">
      {rows.map((row: any) => {
        const item = row.original;
        return (
          <div key={item.id} className="rounded-lg border p-4 cursor-pointer hover:bg-gray-50" onClick={() => onSelect(item)}>
            <div className="font-medium">{item.displayName}</div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>{item.primaryEmail || '—'}</span>
              <span className={item.balance > 0 ? 'text-amber-600 font-medium' : ''}>
                {formatCurrency(item.balance)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
