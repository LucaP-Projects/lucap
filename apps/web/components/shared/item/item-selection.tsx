'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsUpDown } from 'lucide-react';
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@silknexus/ui';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { ItemSheet } from '../../items/section/item-sheet';
import { ItemSelectData, getItemsForSelect } from './actions';
import { ItemListRow } from './item-item';

const itemSearchCache = new Map<string, ItemSelectData[]>();
interface ItemSelectProps {
  onSelect: (item: ItemSelectData) => void;
  selectedItemId?: string;
  initialName?: string;
  className?: string;
  showAddNew?: boolean;
}

const ItemSelect = React.forwardRef<HTMLButtonElement, ItemSelectProps>(
  (
    { onSelect, selectedItemId, initialName, className, showAddNew = false },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [items, setItems] = React.useState<ItemSelectData[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [sheetOpen, setSheetOpen] = React.useState(false);
    const [selectedItem, setSelectedItem] =
      React.useState<ItemSelectData | null>(null);
    const router = useRouter();

    const debouncedSearch = useDebounce(search, 300);

    React.useEffect(() => {
      let mounted = true;

      async function fetchItems() {
        setLoading(true);
        const cached = itemSearchCache.get(debouncedSearch);
        if (cached) {
          setItems(cached);
          setLoading(false);
          return;
        }

        try {
          const response = await getItemsForSelect(debouncedSearch);
          if (!mounted) return;

          if (!response.success) {
            if (response.redirect) {
              router.replace(response.redirect);
              return;
            }
            setItems([]);
            return;
          }

          const items = response.data || [];
          itemSearchCache.set(debouncedSearch, items);
          setItems(items);
        } catch (error) {
          console.error('Error fetching items:', error);
          if (mounted) {
            setItems([]);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }

      fetchItems();
      return () => {
        mounted = false;
      };
    }, [debouncedSearch, router]);

    React.useEffect(() => {
      if (selectedItemId && items.length > 0) {
        const found = items.find((item) => item.id === selectedItemId);
        if (found) {
          setSelectedItem(found);
        }
      }
    }, [selectedItemId, items]);

    const displayValue = React.useMemo(() => {
      if (selectedItem) {
        return selectedItem.name;
      }
      if (initialName && !selectedItemId) {
        return initialName;
      }
      return 'Select item...';
    }, [selectedItem, initialName, selectedItemId]);

    const handleSelect = React.useCallback(
      (item: ItemSelectData) => {
        setSelectedItem(item);
        onSelect(item);
        setOpen(false);
      },
      [onSelect]
    );

    const handleItemSheetSuccess = React.useCallback(() => {
      setSheetOpen(false);
      setOpen(false); // Ensure popover is also closed
      setSearch(''); // Reset search
      itemSearchCache.clear();
      const fetchItems = async () => {
        setLoading(true);
        try {
          const response = await getItemsForSelect(debouncedSearch);
          if (response.success) {
            setItems(response.data || []);
          }
        } catch (error) {
          console.error('Error refreshing items:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchItems();
    }, [debouncedSearch]);

    // Clean up popover state when sheet closes
    React.useEffect(() => {
      if (!sheetOpen) {
        setOpen(false);
      }
    }, [sheetOpen]);

    return (
      <div className="relative w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                'relative h-9 w-full pr-8',
                'text-sm',
                !displayValue && 'text-muted-foreground',
                className
              )}
            >
              <div className="flex w-full items-center overflow-hidden">
                <div className="min-w-0 flex-1 text-left">
                  <span className="block truncate">{displayValue}</span>
                </div>
              </div>
              <ChevronsUpDown className="absolute right-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="max-h-[300px] w-(--radix-popover-trigger-width) overflow-hidden p-0"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <Command className="w-full">
              <CommandInput
                placeholder="Search items..."
                value={search}
                onValueChange={setSearch}
                className="h-9"
              />
              {showAddNew && (
                <div className="border-t px-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start py-1.5 text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpen(false); // Close the popover first
                      // Use a small delay to ensure popover closes before sheet opens
                      setTimeout(() => {
                        setSheetOpen(true);
                      }, 100);
                    }}
                  >
                    + Add new item
                  </Button>
                </div>
              )}
              <CommandEmpty className="p-2 text-sm">
                {loading ? 'Loading...' : 'No items found.'}
              </CommandEmpty>
              <CommandGroup className="max-h-[200px] overflow-y-auto">
                {items?.map((item) => (
                  <ItemListRow
                    key={item.id}
                    item={item}
                    selectedItemId={selectedItemId}
                    onSelect={handleSelect}
                  />
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {showAddNew && (
          <ItemSheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            isNestedForm
            onSuccess={handleItemSheetSuccess}
          />
        )}
      </div>
    );
  }
);
ItemSelect.displayName = 'ItemSelect';
export { ItemSelect };
export type { ItemSelectData, ItemSelectProps };
