import { Controller, UseFormReturn } from 'react-hook-form';


import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { handleNumberInput } from '@/lib/utils';
import { AccountSelect } from '../../shared/account/account-select';
import { ItemFormValues } from '../schema';

interface PurchaseInfoProps {
  form: UseFormReturn<ItemFormValues>;
}

export function PurchaseInfo({ form }: PurchaseInfoProps) {
  const purchasable = form.watch('purchasable');

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-lg font-semibold">Purchase Information</h2>

      <Controller
        control={form.control}
        name="purchasable"
        render={({ field }) => (
          <Field className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FieldLabel className="text-base">Purchase this item</FieldLabel>
              <p className="text-muted-foreground text-sm">
                Enable if you purchase this item from vendors
              </p>
            </div>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
          </Field>
        )}
      />

      {purchasable && (
        <div className="space-y-4">
          <Controller
            control={form.control}
            name="cost"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Cost</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={field.value || ''}
                    onChange={(e) =>
                      handleNumberInput(e.target.value, field.onChange)
                    }
                  />
                {fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="expenseAccountId"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Expense Account</FieldLabel>
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

          <Controller
            control={form.control}
            name="purchaseDescription"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Purchase Description</FieldLabel>
                  <Textarea
                    {...field}
                    value={field.value || ''}
                    placeholder="Description shown on purchase forms"
                    className="h-20"
                  />
                {fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="preferredVendorId"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Preferred Vendor</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vendor" />
                    </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dfg">None</SelectItem>
                    <SelectItem value="vendor1">Vendor 1</SelectItem>
                    <SelectItem value="vendor2">Vendor 2</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              
              </Field>
            )}
          />
        </div>
      )}
    </div>
  );
}
