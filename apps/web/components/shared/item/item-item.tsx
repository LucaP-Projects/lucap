'use client';

import { Check, Package } from 'lucide-react';
import { CommandItem } from '@silknexus/ui';
import { cn } from '@/lib/utils';
import { ItemSelectData } from './actions';

function getFormattedPriceDisplay(item: ItemSelectData) {
  if (!item.sellable) {
    return 'N/A';
  }

  const originalPrice = Number(item.salesPrice) || 0;
  if (
    item.status === 'DISCONTINUED' &&
    item.discountType &&
    typeof item.discountValue === 'number' &&
    item.discountValue > 0
  ) {
    let discountedPrice = originalPrice;

    if (item.discountType === 'PERCENTAGE') {
      discountedPrice = originalPrice * (1 - item.discountValue / 100);
    } else if (item.discountType === 'FIXED_AMOUNT') {
      discountedPrice = originalPrice - item.discountValue;
    }
    discountedPrice = Math.max(discountedPrice, 0);
    return (
      <span className="flex flex-col items-end">
        <span className="text-muted-foreground text-xs line-through">
          ${originalPrice.toFixed(2)}
        </span>
        <span className="font-medium text-red-600">
          ${discountedPrice.toFixed(2)}
        </span>
      </span>
    );
  }

  return `$${originalPrice.toFixed(2)}`;
}

interface ItemListRowProps {
  item: ItemSelectData;
  selectedItemId?: string;
  onSelect: (item: ItemSelectData) => void;
}

export function ItemListRow({
  item,
  selectedItemId,
  onSelect
}: ItemListRowProps) {
  return (
    <CommandItem
      value={`${item.name} ${item.sku || ''}`}
      onSelect={() => onSelect(item)}
      className={cn(
        'flex items-center gap-2',
        selectedItemId === item.id && 'bg-accent'
      )}
    >
      <Package className="h-4 w-4" />
      <div className="flex flex-col">
        <span>{item.name}</span>
        {(item.sku || item.description) && (
          <span className="text-muted-foreground text-sm">
            {item.sku && `SKU: ${item.sku}`}
            {item.sku && item.description && ' - '}
            {item.description}
          </span>
        )}
      </div>
      <span className="ml-auto text-sm">{getFormattedPriceDisplay(item)}</span>
      {selectedItemId === item.id && <Check className="ml-2 h-4 w-4" />}
    </CommandItem>
  );
}
