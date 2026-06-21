import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';


import { handleNumberInput } from '@/lib/utils';
import { AccountSelect } from '../../shared/account/account-select';
import { ItemFormValues } from '../schema';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface SalesInfoProps {
  form: UseFormReturn<ItemFormValues>;
}

export function SalesInfo({ form }: SalesInfoProps) {
  const sellable = form.watch('sellable');
  const discountEnabled = form.watch('discountEnabled');
  const discountType = form.watch('discountType');
  const salesPrice = Number(form.watch('salesPrice')) || 0;
  const itemStatus = form.watch('status'); // Watch the item status

  // Effect to auto-enable discount when status is DISCONTINUED
  useEffect(() => {
    // Only run this effect when the status changes to DISCONTINUED from outside
    if (itemStatus === 'DISCONTINUED' && !discountEnabled) {
      // Set discount enabled without triggering the other useEffect
      form.setValue('discountEnabled', true, { shouldDirty: true });

      // Make sure we set a default discount type and value if none exists
      if (!form.getValues('discountType')) {
        form.setValue('discountType', 'PERCENTAGE', { shouldDirty: true });
      }
      if (!form.getValues('discountValue')) {
        form.setValue('discountValue', 10, { shouldDirty: true });
      }
    }
  }, [itemStatus, discountEnabled, form]);

  useEffect(() => {
    const formStatus = form.getValues('status');
    const shouldBeDiscounted = !!discountEnabled;

    if (shouldBeDiscounted && formStatus !== 'DISCONTINUED') {
      form.setValue('status', 'DISCONTINUED', { shouldDirty: true });
    } else if (!shouldBeDiscounted && formStatus === 'DISCONTINUED') {
      form.setValue('status', 'ACTIVE', { shouldDirty: true });
    }
  }, [discountEnabled, form]);

  // Validation for discount value
  const validateDiscountValue = (value: any) => {
    if (discountType === 'PERCENTAGE') {
      if (Number(value) > 100) return 'Percentage cannot exceed 100%';
      if (Number(value) < 0) return 'Percentage cannot be negative';
    } else if (discountType === 'FIXED_AMOUNT') {
      if (Number(value) > salesPrice)
        return 'Discount cannot exceed sales price';
      if (Number(value) < 0) return 'Discount cannot be negative';
    }
    return true;
  };

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-lg font-semibold">Sales Information</h2>

      <FormField
        control={form.control}
        name="sellable"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-3 sm:p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Sell this item</FormLabel>
              <p className="text-muted-foreground text-sm">
                Enable if you sell this item to customers
              </p>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      {sellable && (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="salesPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sales Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={field.value || ''}
                    onChange={(e) =>
                      handleNumberInput(e.target.value, field.onChange)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="incomeAccountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Income Account</FormLabel>
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

          {/* Discount Toggle */}
          <FormField
            control={form.control}
            name="discountEnabled"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <FormLabel className="text-base">
                    Discount this item
                  </FormLabel>
                  <p className="text-muted-foreground text-sm">
                    Enable to apply a discount to this item
                  </p>

                  {/* Status Change Indicator */}
                  <div className="mt-2 flex items-center">
                    <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    <span className="text-sm font-medium">
                      Item Status:{' '}
                      <span
                        className={`font-bold ${field.value ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {field.value ? 'DISCONTINUED' : 'ACTIVE'}
                      </span>
                    </span>
                    {field.value && (
                      <div className="ml-2 rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-xs text-red-800">
                        Discount Mode
                      </div>
                    )}
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (checked) {
                        // When enabling discount, set status to DISCONTINUED
                        form.setValue('status', 'DISCONTINUED', {
                          shouldDirty: true
                        });
                      } else {
                        // When disabling discount, set status back to ACTIVE
                        form.setValue('status', 'ACTIVE', {
                          shouldDirty: true
                        });
                        // Also clear discount fields
                        form.setValue('discountType', null, {
                          shouldDirty: true
                        });
                        form.setValue('discountValue', null, {
                          shouldDirty: true
                        });
                      }
                    }}
                    // Remove the disabled attribute to allow toggling back
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Discount Fields */}
          {(discountEnabled || itemStatus === 'DISCONTINUED') && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">
                          Fixed Amount
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discountValue"
                rules={{ validate: validateDiscountValue }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={field.value || ''}
                        onChange={(e) =>
                          handleNumberInput(e.target.value, field.onChange)
                        }
                        min={0}
                        max={discountType === 'PERCENTAGE' ? 100 : salesPrice}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="salesDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sales Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ''}
                    placeholder="Description shown on sales forms"
                    className="h-20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
