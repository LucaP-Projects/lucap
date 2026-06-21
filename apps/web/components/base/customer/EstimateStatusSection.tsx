import React, { memo } from 'react';
import { format } from 'date-fns';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {  CalendarIcon } from 'lucide-react';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { EstimateFormValues } from '../../estimate/schema';

export const EstimateStatusSection: React.FC = memo(() => {
  const { control } = useFormContext<EstimateFormValues>();
  const validUntil = useWatch({
    control,
    name: 'validUntil'
  });

  return (
    <div className="flex items-center gap-2">
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger className="h-9 w-[130px] border-0 bg-gray-50/50 dark:bg-gray-800/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        )}
      />

      <Controller
        control={control}
        name="validUntil"
        render={({ field }) => (
          <Popover>
            <PopoverTrigger className="inline-flex h-9 w-[130px] items-center justify-start gap-2 rounded-md border-0 bg-gray-50/50 px-3 text-sm hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-700">
              <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="truncate text-gray-900 dark:text-gray-100">
                {validUntil ? format(validUntil, 'dd/MM/yy') : 'Valid until'}
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={validUntil}
                onSelect={field.onChange}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        )}
      />
    </div>
  );
});

EstimateStatusSection.displayName = 'EstimateStatusSection';
