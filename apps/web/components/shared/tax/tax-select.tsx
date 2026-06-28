import * as React from 'react';
import { Command, CommandInput, CommandEmpty, CommandGroup } from 'cmdk';
import { useRouter } from 'next/navigation';
import { ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

import { TaxSheet } from '../../tax/sheet';
import { TaxSelectData, getTaxesForSelect } from './actions';
import { TaxItem } from './tax-items';

interface TaxSelectProps {
  onSelect: (tax: TaxSelectData | null) => void;
  selectedTaxId?: string | null;
  className?: string;
  showAddNew?: boolean;
}

const TaxSelect = React.memo(
  React.forwardRef<HTMLButtonElement, TaxSelectProps>(
    ({ onSelect, selectedTaxId, className, showAddNew = false }, ref) => {
      const [sheetOpen, setSheetOpen] = React.useState(false);
      const [open, setOpen] = React.useState(false);
      const [search, setSearch] = React.useState('');
      const [taxes, setTaxes] = React.useState<TaxSelectData[]>([]);
      const [loading, setLoading] = React.useState(false);
      const router = useRouter();
      const debouncedSearch = useDebounce(search, 300);

      const fetchTaxes = React.useCallback(async () => {
        setLoading(true);
        try {
          const response = await getTaxesForSelect(debouncedSearch);
          if (!response.success) {
            if (response.redirect) {
              router.replace(response.redirect);
              return;
            }
            setTaxes([]);
            return;
          }
          setTaxes(response.data || []);
        } catch (error) {
          console.error('Error fetching taxes:', error);
          setTaxes([]);
        } finally {
          setLoading(false);
        }
      }, [debouncedSearch, router]);

      React.useEffect(() => {
        fetchTaxes();
      }, [debouncedSearch, fetchTaxes]);

      const selectedTax = React.useMemo(
        () =>
          selectedTaxId
            ? taxes.find((t) => t.id === selectedTaxId) || null
            : null,
        [taxes, selectedTaxId]
      );

      const handleSelect = React.useCallback(
        (tax: TaxSelectData) => {
          onSelect(tax);
          setOpen(false);
        },
        [onSelect]
      );
      const handleTaxCreated = React.useCallback(() => {
        setSheetOpen(false);
        setOpen(false); // Ensure popover is also closed
        setSearch(''); // Reset search
        fetchTaxes();
      }, [fetchTaxes]);

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
                  !selectedTax && 'text-muted-foreground',
                  className
                )}
              >
                <div className="flex w-full items-center overflow-hidden">
                  <div className="min-w-0 flex-1 text-left">
                    <span className="block truncate">
                      {selectedTax ? selectedTax.name : 'Select tax rate...'}
                    </span>
                  </div>
                  {selectedTax && (
                    <span className="text-muted-foreground ml-2 shrink-0">
                      {selectedTax.rate}%
                    </span>
                  )}
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
                  placeholder="Search tax rates..."
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
                      + Add new tax rate
                    </Button>
                  </div>
                )}
                <CommandEmpty className="p-2 text-sm">
                  {loading ? 'Loading...' : 'No tax rate found.'}
                </CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-y-auto">
                  {taxes?.map((tax) => (
                    <TaxItem
                      key={tax.id}
                      tax={tax}
                      selectedTaxId={selectedTaxId || undefined}
                      onSelect={handleSelect}
                    />
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          {/* TaxSheet outside of Popover to avoid conflicts */}
          <TaxSheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            onSuccess={handleTaxCreated}
            isNestedForm
          />
        </div>
      );
    }
  )
);

TaxSelect.displayName = 'TaxSelect';

export { TaxSelect };
export type { TaxSelectData, TaxSelectProps };
