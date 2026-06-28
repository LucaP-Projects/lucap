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
  CustomerSelectData,
  getCustomerById,
  getCustomersForSelect
} from './actions';
import { CustomerItem } from './cubtomer-item';

const customerSearchCache = new Map<string, CustomerSelectData[]>();

interface CustomerSelectProps {
  onSelect: (customer: CustomerSelectData) => void;
  selectedCustomerId?: string;
  className?: string;
}

const CustomerSelect = React.memo(
  React.forwardRef<HTMLButtonElement, CustomerSelectProps>(
    ({ onSelect, selectedCustomerId, className }, ref) => {
      const [open, setOpen] = React.useState(false);
      const [search, setSearch] = React.useState('');
      const [customers, setCustomers] = React.useState<CustomerSelectData[]>(
        []
      );
      const [loading, setLoading] = React.useState(false);
      const [selectedCustomer, setSelectedCustomer] =
        React.useState<CustomerSelectData | null>(null);
      const router = useRouter();

      const debouncedSearch = useDebounce(search, 300);

      React.useEffect(() => {
        let mounted = true;

        async function fetchCustomers() {
          setLoading(true);

          const cached = customerSearchCache.get(debouncedSearch);
          if (cached) {
            setCustomers(cached);
            setLoading(false);
            return;
          }

          try {
            const response = await getCustomersForSelect(debouncedSearch);
            if (!mounted) return;

            if (!response.success) {
              if (response.redirect) router.replace(response.redirect);
              return;
            }

            customerSearchCache.set(debouncedSearch, response.data || []);
            setCustomers(response.data || []);
          } catch (error) {
            console.error('Error fetching customers:', error);
          } finally {
            if (mounted) setLoading(false);
          }
        }

        fetchCustomers();
        return () => {
          mounted = false;
        };
      }, [debouncedSearch, router]);

      React.useEffect(() => {
        let mounted = true;

        async function fetchInitialCustomer() {
          if (!selectedCustomerId) return;

          try {
            const response = await getCustomerById(selectedCustomerId);
            if (!mounted || !response.data) return;
            if (response.data.id === selectedCustomerId) {
              setSelectedCustomer(response.data);
            }
          } catch (error) {
            console.error('Error fetching initial customer:', error);
          }
        }

        fetchInitialCustomer();
        return () => {
          mounted = false;
        };
      }, [selectedCustomerId, router]);

      const handleSelect = React.useCallback(
        (customer: CustomerSelectData) => {
          setSelectedCustomer(customer);
          onSelect(customer);
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
                  !selectedCustomer && 'text-muted-foreground',
                  className
                )}
              >
                <div className="flex w-full items-center overflow-hidden">
                  <div className="min-w-0 flex-1 text-left">
                    <span className="block truncate">
                      {selectedCustomer
                        ? selectedCustomer.displayName
                        : 'Select customer...'}
                    </span>
                  </div>
                </div>
                <ChevronsUpDown className="absolute right-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="max-h-75 w-(--radix-popover-trigger-width) overflow-hidden p-0"
              align="start"
              side="bottom"
              sideOffset={4}
            >
              <Command className="w-full">
                <CommandInput
                  placeholder="Search customers..."
                  value={search}
                  onValueChange={setSearch}
                  className="h-9"
                />
                <CommandEmpty className="p-2 text-sm">
                  {loading ? 'Loading...' : 'No customer found.'}
                </CommandEmpty>
                <CommandGroup className="max-h-50 overflow-y-auto">
                  {customers?.map((customer) => (
                    <CustomerItem
                      key={customer.id}
                      customer={customer}
                      level={0}
                      selectedCustomerId={selectedCustomerId}
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

CustomerSelect.displayName = 'CustomerSelect';
export { CustomerSelect };
export type { CustomerSelectData, CustomerSelectProps };
