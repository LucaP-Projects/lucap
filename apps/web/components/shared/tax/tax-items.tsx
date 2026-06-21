import React from 'react';
import { Check } from 'lucide-react';
import { CommandItem } from '@silknexus/ui';
import { cn } from '@/lib/utils';
import { TaxSelectData } from './actions';

interface TaxItemProps {
  tax: TaxSelectData;
  selectedTaxId?: string;
  onSelect: (tax: TaxSelectData) => void;
}

export const TaxItem = React.memo(
  ({ tax, selectedTaxId, onSelect }: TaxItemProps) => {
    const isSelected = selectedTaxId === tax.id;

    const handleSelect = React.useCallback(() => {
      onSelect(tax);
    }, [onSelect, tax]);

    return (
      <CommandItem
        value={tax.name}
        onSelect={handleSelect}
        className={cn(
          'flex items-center justify-between px-2 py-1.5',
          isSelected && 'bg-accent'
        )}
      >
        <div className="flex items-center">
          <span className="font-medium">{tax.name}</span>
          <span className="text-muted-foreground ml-2 text-sm">
            ({tax.rate}%)
          </span>
        </div>
        {isSelected && <Check className="h-4 w-4 shrink-0" />}
      </CommandItem>
    );
  }
);

TaxItem.displayName = 'TaxItem';
