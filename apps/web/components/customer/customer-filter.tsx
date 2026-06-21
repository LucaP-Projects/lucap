import React from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import { CustomerStatistics } from '@/types/customer';
import { Button } from '../ui/button';

export default function CustomerFilterBar({
  statistics
}: {
  statistics: CustomerStatistics;
}) {
  const sections = [
    {
      amount: statistics.estimates.amount,
      label: `${statistics.estimates.count} estimates`,
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      bar: 'bg-blue-500'
    },
    {
      amount: statistics.unbilledAmount,
      label: 'Unbilled income',
      bg: 'bg-violet-50',
      text: 'text-violet-600',
      bar: 'bg-violet-500'
    },
    {
      amount: statistics.overdueInvoices.amount,
      label: `${statistics.overdueInvoices.count} overdue invoices`,
      bg: 'bg-red-50',
      text: 'text-red-600',
      bar: 'bg-red-500'
    },
    {
      amount: statistics.openInvoices.amount,
      label: `${statistics.openInvoices.count} open invoices`,
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      bar: 'bg-slate-400'
    },
    {
      amount: statistics.recentlyPaid.amount,
      label: `${statistics.recentlyPaid.count} recently paid`,
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      bar: 'bg-emerald-500'
    }
  ];

  return (
    <div className="mb-4 space-y-1">
      <div className="flex">
        {sections.map((section, i) => (
          <div key={i} className={cn('flex-1 pl-1 lg:min-w-[200px]')}>
            <div className="text-lg font-bold">
              {formatCurrency(section.amount)}
            </div>
            <div className="pb-2 text-xs">{section.label}</div>
            <Button
              key={i}
              className={cn(
                section.bar,
                'hover:bg-[ h-4 rounded-sm hover:h-6' +
                  section.bar +
                  '] transition-all duration-300 hover:brightness-75'
              )}
              style={{
                width: '100%'
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex h-8 items-end gap-1 overflow-hidden px-3" />
    </div>
  );
}
