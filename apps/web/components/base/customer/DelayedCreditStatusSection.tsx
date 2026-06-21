import React, { memo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { DelayedCreditFormValues } from '../../delayed-credits/schema';

export const DelayedCreditStatusSection: React.FC = memo(() => {
  const { control } = useFormContext<DelayedCreditFormValues>();

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
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CREDITED">Created</SelectItem>
              <SelectItem value="CANCELED">Canceled</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
});

DelayedCreditStatusSection.displayName = 'DelayedCreditStatusSection';
