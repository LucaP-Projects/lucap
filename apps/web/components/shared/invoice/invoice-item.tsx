'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { CommandItem } from '@silknexus/ui';
import { cn } from '@/lib/utils';
import { InvoiceSelectData } from './actions';

interface InvoiceItemProps {
  invoice: InvoiceSelectData;
  selectedInvoiceId?: string;
  onSelect: (invoice: InvoiceSelectData) => void;
}

export const InvoiceItem = React.memo(
  ({ invoice, selectedInvoiceId, onSelect }: InvoiceItemProps) => {
    const isSelected = selectedInvoiceId === invoice.id;

    const handleSelect = React.useCallback(() => {
      onSelect(invoice);
    }, [onSelect, invoice]);

    const formattedAmount = React.useMemo(() => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(invoice.amount), [invoice.amount]);

    const formattedDate = React.useMemo(() => new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium'
      }).format(new Date(invoice.dueDate)), [invoice.dueDate]);

    return (
      <CommandItem
        value={`${invoice.number} ${invoice.customer.displayName}`}
        onSelect={handleSelect}
        className={cn('flex items-start gap-2 py-3', isSelected && 'bg-accent')}
      >
        <div className="flex flex-1 flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex min-w-[200px] flex-col">
            <span className="truncate font-medium">{invoice.number}</span>
            <span className="text-muted-foreground truncate text-sm">
              {invoice.customer.displayName}
            </span>
          </div>
          <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
            <span className="text-sm font-medium">{formattedAmount}</span>
            <span className="text-muted-foreground text-sm sm:inline">
              {formattedDate}
            </span>
            <span
              className={cn(
                'w-fit rounded-full px-2 py-1 text-xs',
                invoice.status === 'PAID' && 'bg-green-100 text-green-800',
                invoice.status === 'PENDING' && 'bg-yellow-100 text-yellow-800',
                invoice.status === 'OVERDUE' && 'bg-red-100 text-red-800'
              )}
            >
              {invoice.status}
            </span>
          </div>
        </div>
        {isSelected && <Check className="ml-2 mt-1 h-4 w-4 shrink-0 sm:mt-0" />}
      </CommandItem>
    );
  }
);

InvoiceItem.displayName = 'InvoiceItem';
