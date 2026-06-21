'use client';
import { useState } from 'react';
import { Calendar as CalendarIcon, Check, Command } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { dateRanges } from './utils';

const DOCUMENT_TYPES = {
  ESTIMATE: 'Estimate',
  INVOICE: 'Invoice',
  DELAYED_CREDIT: 'Delayed Credit',
  DELAYED_CHARGE: 'Delayed Charge',
  CREDIT_MEMO: 'Credit Memo',
  REFUND_RECEIPT: 'Refund Receipt',
  SALES_RECEIPT: 'Sales Receipt'
} as const;

type DocumentType = keyof typeof DOCUMENT_TYPES;

interface DocumentFiltersProps<T> {
  documentType: DocumentType;
  filters: {
    status?: T;
    dateRange: string;
    search: string;
  };
  search: string;
  isLoading: boolean;
  statusEnum: Record<string, T>;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDateRangeChange: (value: string) => void;
}

export function DocumentFilters<T extends string>({
  documentType,
  filters,
  search,
  isLoading,
  statusEnum,
  onSearchChange,
  onStatusChange,
  onDateRangeChange
}: DocumentFiltersProps<T>) {
  const [dateOpen, setDateOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:items-center lg:space-x-2">
        <div className="relative">
          <Input
            placeholder={`Search ${DOCUMENT_TYPES[documentType].toLowerCase()}s...`}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full lg:max-w-[300px]"
          />
          {isLoading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          )}
        </div>

        <Select
          value={filters.status?.toString() || 'ALL'}
          onValueChange={onStatusChange}
        >
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.values(statusEnum).map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={dateOpen}
              className="w-full justify-between lg:w-[200px]"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {
                dateRanges.find((range) => range.value === filters.dateRange)
                  ?.label
              }
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 lg:w-[200px]">
            <Command>
              <CommandEmpty>No range found.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-auto">
                {dateRanges.map((range) => (
                  <CommandItem
                    key={range.value}
                    value={range.value}
                    onSelect={() => {
                      onDateRangeChange(range.value);
                      setDateOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        filters.dateRange === range.value
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    {range.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

{
  /* <DocumentFilters
  documentType="INVOICE"
  filters={filters}
  search={search}
  isLoading={isLoading}
  onSearchChange={handleSearchChange}
  onStatusChange={handleStatusChange}
  onDateRangeChange={handleDateRangeChange}
/>; */
}
