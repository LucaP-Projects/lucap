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
import { DelayedChargeFormValues } from '../../delayed-charges/schema';

export const DelayedChargeStatusSection: React.FC = memo(() => {
  const { control } = useFormContext<DelayedChargeFormValues>();

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
              <SelectItem value="INVOICED">Invoiced</SelectItem>
              <SelectItem value="CANCELED">Canceled</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
});

DelayedChargeStatusSection.displayName = 'DelayedChargeStatusSection';
