import { ShoppingBag, Package, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const types = [
  {
    id: 'INVENTORY',
    icon: ShoppingBag,
    label: 'Inventory',
    description: 'Track stock levels and manage inventory'
  },
  {
    id: 'NON_INVENTORY',
    icon: Package,
    label: 'Non-inventory',
    description: 'Items you buy or sell without tracking quantity'
  },
  {
    id: 'SERVICE',
    icon: Wrench,
    label: 'Service',
    description: 'Services you provide to customers'
  }
];

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {types.map((type) => {
        const Icon = type.icon;
        const isSelected = value === type.id;

        return (
          <Button
            key={type.id}
            type="button"
            variant="outline"
            className={cn(
              'hover:bg-accent h-auto flex-col space-y-2 p-4',
              isSelected && 'border-primary bg-accent'
            )}
            onClick={() => onChange(type.id)}
          >
            <Icon
              className={cn(
                'h-6 w-6',
                isSelected ? 'text-primary' : 'text-muted-foreground'
              )}
            />
            <div className="space-y-1">
              <h3 className="font-medium">{type.label}</h3>
              <p className="text-muted-foreground mt-1 whitespace-normal break-words text-xs leading-tight">
                {type.description}
              </p>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
