'use client';

import { Check, User } from 'lucide-react';
import { CommandItem } from '@/components/ui/command';

import { cn } from '@/lib/utils';
import { CustomerSelectData } from './actions';

interface CustomerItemProps {
  customer: CustomerSelectData;
  level: number;
  selectedCustomerId?: string;
  onSelect: (customer: CustomerSelectData) => void;
}

export function CustomerItem({
  customer,
  level,
  selectedCustomerId,
  onSelect
}: CustomerItemProps) {
  const paddingLeft = level * 16;

  return (
    <>
      <CommandItem
        value={customer.displayName}
        onSelect={() => onSelect(customer)}
        className={cn(
          'flex items-center gap-2',
          selectedCustomerId === customer.id && 'bg-accent'
        )}
        style={{ paddingLeft: `${paddingLeft + 16}px` }}
      >
        <User className="h-4 w-4" />
        <span>{customer.displayName}</span>
        {customer.primaryEmail && (
          <span className="text-muted-foreground ml-2 text-sm">
            ({customer.primaryEmail})
          </span>
        )}
        {selectedCustomerId === customer.id && (
          <Check className="ml-auto h-4 w-4" />
        )}
      </CommandItem>
      {customer.subCustomers?.map((sub) => (
        <CustomerItem
          key={sub.id}
          customer={sub}
          level={level + 1}
          selectedCustomerId={selectedCustomerId}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}
