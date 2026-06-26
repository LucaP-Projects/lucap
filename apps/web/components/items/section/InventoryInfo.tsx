import React from 'react';
import { format } from 'date-fns';
import { Controller, UseFormReturn } from 'react-hook-form';
import z from 'zod';
import {  CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn, handleNumberInput } from '@/lib/utils';
import { AccountSelect } from '../../shared/account/account-select';
import { itemFormSchema } from '../schema';

interface InventoryInfoProps {
  form: UseFormReturn<z.output<typeof itemFormSchema>>;
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
        <Controller
          control={form.control}
          name="initialQuantity"
          rules={{ required: isInventoryItem }}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel
                className={cn(
                  'flex items-center gap-2',
                  isInventoryItem && 'text-destructive font-medium'
                )}
              >
                Initial quantity on hand
                {isInventoryItem && '*'}
              </FieldLabel>
                <Input
                  type="number"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    handleNumberInput(e.target.value, field.onChange, 0)
                  }
                  onBlur={() => form.trigger('initialQuantity')}
                />
              {fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="reorderPoint"
          rules={{ required: isInventoryItem }}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel
                className={cn(
                  'flex items-center gap-2',
                  isInventoryItem && 'text-destructive font-medium'
                )}
              >
                Reorder point
                {isInventoryItem && '*'}
              </FieldLabel>
                <Input
                  type="number"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    handleNumberInput(e.target.value, field.onChange, 0)
                  }
                  onBlur={() => form.trigger('reorderPoint')}
                />
              {fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="asOfDate"
          rules={{ required: isInventoryItem }}
          render={({ field, fieldState }) => (
            <Field className="flex flex-col">
              <FieldLabel
                className={cn(
                  'flex items-center gap-2',
                  isInventoryItem && 'text-destructive font-medium'
                )}
              >
                As of date
                {isInventoryItem && '*'}
              </FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
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
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={(date) => {
                      field.onChange(date || new Date());
                      form.trigger('asOfDate');
                    }}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              {fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="inventoryAssetAccountId"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel
                className={cn(
                  'flex items-center gap-2',
                  isInventoryItem && 'text-destructive font-medium'
                )}
              >
                Inventory Asset Account
                {isInventoryItem && '*'}
              </FieldLabel>
                <AccountSelect
                  onSelect={(account) => field.onChange(account.id)}
                  selectedAccountId={field.value}
                  showCreate
                />
              {fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </div>
    </div>
  );
}

export default InventoryInfo;
