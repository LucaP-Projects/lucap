'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup
} from '@/components/ui/command';

import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import {
  InvoiceSelectData,
  getInvoiceById,
  getInvoicesForSelect
} from './actions';
import { InvoiceItem } from './invoice-item';

interface InvoiceSelectProps {
  onSelect: (invoice: InvoiceSelectData) => void;
  selectedInvoiceId?: string;
  className?: string;
}

const InvoiceSelect = React.memo(
  React.forwardRef<HTMLButtonElement, InvoiceSelectProps>(
    ({ onSelect, selectedInvoiceId, className }, ref) => {
      const [open, setOpen] = React.useState(false);
      const [search, setSearch] = React.useState('');
      const [invoices, setInvoices] = React.useState<InvoiceSelectData[]>([]);
      const [loading, setLoading] = React.useState(false);
      const [selectedInvoice, setSelectedInvoice] =
        React.useState<InvoiceSelectData | null>(null);
      const router = useRouter();

      const debouncedSearch = useDebounce(search, 300);

      const fetchInvoices = React.useCallback(async () => {
        setLoading(true);
        try {
          const response = await getInvoicesForSelect(debouncedSearch);
          if (!response.success) {
            if (response.redirect) {
              router.replace(response.redirect);
              return;
            }
            setInvoices([]);
            return;
          }

          setInvoices(response.data || []);
        } catch (error) {
          console.error('Error fetching invoices:', error);
          setInvoices([]);
        } finally {
          setLoading(false);
        }
      }, [debouncedSearch, router]);

      React.useEffect(() => {
        fetchInvoices();
      }, [fetchInvoices]);

      React.useEffect(() => {
        async function fetchInitialInvoice() {
          if (selectedInvoiceId && !selectedInvoice) {
            try {
              const response = await getInvoiceById(selectedInvoiceId);
              if (!response.success) {
                if (response.redirect) {
                  router.replace(response.redirect);
                  return;
                }
                return;
              }

              if (response.data) {
                setSelectedInvoice(response.data);
              }
            } catch (error) {
              console.error('Error fetching initial invoice:', error);
            }
          }
        }

        fetchInitialInvoice();
      }, [selectedInvoiceId, selectedInvoice, router]);

      const handleSelect = React.useCallback(
        (invoice: InvoiceSelectData) => {
          setSelectedInvoice(invoice);
          onSelect(invoice);
          setOpen(false);
        },
        [onSelect]
      );

      return (
        <div className="relative w-full">
          <Popover open={open} onOpenChange={setOpen} modal>
            <PopoverTrigger asChild>
              <Button
                ref={ref}
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  'relative h-9 w-full pr-8',
                  'text-sm',
                  !selectedInvoice && 'text-muted-foreground',
                  className
                )}
              >
                <div className="flex w-full items-center overflow-hidden">
                  <div className="min-w-0 flex-1 text-left">
                    <span className="block truncate">
                      {selectedInvoice
                        ? `${selectedInvoice.number} - ${selectedInvoice.customer.displayName}`
                        : 'Select invoice...'}
                    </span>
                  </div>
                  {selectedInvoice && (
                    <span className="text-muted-foreground ml-2 shrink-0">
                      ${selectedInvoice.amount.toFixed(2)}
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
                  placeholder="Search invoices..."
                  value={search}
                  onValueChange={setSearch}
                  className="h-9"
                />
                <CommandEmpty className="p-2 text-sm">
                  {loading ? 'Loading...' : 'No invoice found.'}
                </CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-y-auto">
                  {invoices?.map((invoice) => (
                    <InvoiceItem
                      key={invoice.id}
                      invoice={invoice}
                      selectedInvoiceId={selectedInvoiceId}
                      onSelect={handleSelect}
                    />
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      );
    }
  )
);

InvoiceSelect.displayName = 'InvoiceSelect';

export { InvoiceSelect };
export type { InvoiceSelectData, InvoiceSelectProps };
