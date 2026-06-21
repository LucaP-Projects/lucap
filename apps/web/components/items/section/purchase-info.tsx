import { UseFormReturn } from 'react-hook-form';


import { handleNumberInput } from '@/lib/utils';
import { AccountSelect } from '../../shared/account/account-select';
import { ItemFormValues } from '../schema';
import FormField from '@/components/lang/FormField';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface PurchaseInfoProps {
  form: UseFormReturn<ItemFormValues>;
}

export function PurchaseInfo({ form }: PurchaseInfoProps) {
  const purchasable = form.watch('purchasable');

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-lg font-semibold">Purchase Information</h2>

      <FormField
        control={form.control}
        name="purchasable"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Purchase this item</FormLabel>
              <p className="text-muted-foreground text-sm">
                Enable if you purchase this item from vendors
              </p>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      {purchasable && (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost</FormLabel>
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
            name="expenseAccountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expense Account</FormLabel>
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

          <FormField
            control={form.control}
            name="purchaseDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ''}
                    placeholder="Description shown on purchase forms"
                    className="h-20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferredVendorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Vendor</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vendor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="dfg">None</SelectItem>
                    <SelectItem value="vendor1">Vendor 1</SelectItem>
                    <SelectItem value="vendor2">Vendor 2</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
