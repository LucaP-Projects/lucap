import React from 'react';
import { format } from 'date-fns';
import { UseFormReturn } from 'react-hook-form';
import {  CalendarIcon } from 'lucide-react';

import { cn, handleNumberInput } from '@/lib/utils';
import { AccountSelect } from '../../shared/account/account-select';
import { ItemFormValues } from '../schema';
import FormField from '@/components/lang/FormField';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Popover } from 'radix-ui';

interface InventoryInfoProps {
  form: UseFormReturn<ItemFormValues>;
}

export function InventoryInfo({ form }: InventoryInfoProps) {
  const itemType = form.watch('type');
  const isInventoryItem = itemType === 'INVENTORY';

  React.useEffect(() => {
    if (isInventoryItem) {
      // Ensure default values for inventory items
      const initialQuantity = form.getValues('initialQuantity');
      const reorderPoint = form.getValues('reorderPoint');

      if (initialQuantity === undefined || initialQuantity === null) {
        form.setValue('initialQuantity', 0);
      }

      if (reorderPoint === undefined || reorderPoint === null) {
        form.setValue('reorderPoint', 0);
      }

      if (!form.getValues('asOfDate')) {
        form.setValue('asOfDate', new Date());
      }

      // Trigger validation when switching to inventory type
      form.trigger(['initialQuantity', 'reorderPoint', 'asOfDate']);
    }
  }, [isInventoryItem, form]);

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-lg font-semibold">Inventory Details</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="initialQuantity"
          rules={{ required: isInventoryItem }}
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  'flex items-center gap-2',
                  isInventoryItem && 'text-destructive font-medium'
                )}
              >
                Initial quantity on hand
                {isInventoryItem && '*'}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    handleNumberInput(e.target.value, field.onChange, 0)
                  }
                  onBlur={() => form.trigger('initialQuantity')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reorderPoint"
          rules={{ required: isInventoryItem }}
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  'flex items-center gap-2',
                  isInventoryItem && 'text-destructive font-medium'
                )}
              >
                Reorder point
                {isInventoryItem && '*'}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    handleNumberInput(e.target.value, field.onChange, 0)
                  }
                  onBlur={() => form.trigger('reorderPoint')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="asOfDate"
          rules={{ required: isInventoryItem }}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel
                className={cn(
                  'flex items-center gap-2',
                  isInventoryItem && 'text-destructive font-medium'
                )}
              >
                As of date
                {isInventoryItem && '*'}
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                      onClick={() => form.trigger('asOfDate')}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={(date) => {
                      field.onChange(date || new Date());
                      form.trigger('asOfDate');
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inventoryAssetAccountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  'flex items-center gap-2',
                  isInventoryItem && 'text-destructive font-medium'
                )}
              >
                Inventory Asset Account
                {isInventoryItem && '*'}
              </FormLabel>
              <FormControl>
                <AccountSelect
                  onSelect={(account) => field.onChange(account.id)}
                  selectedAccountId={field.value}
                  showCreate
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

export default InventoryInfo;
