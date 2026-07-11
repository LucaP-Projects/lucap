'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { createCurrency, updateCurrency } from './actions';
import { companyCurrencyFormSchema, CompanyCurrencyFormValues, CompanyCurrencyRecord } from './schema';

interface CompanyCurrencyFormProps {
  onSuccess: () => void;
  formRef: React.RefObject<HTMLFormElement>;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  currency?: CompanyCurrencyRecord;
}

export function CompanyCurrencyForm({
  onSuccess,
  formRef,
  isSubmitting,
  setIsSubmitting,
  currency,
}: CompanyCurrencyFormProps) {
  const router = useRouter();
  const isEditMode = !!currency;

  const form = useForm({
    resolver: zodResolver(companyCurrencyFormSchema),
    defaultValues: {
      currency: currency?.currency || '',
      name: currency?.name || '',
      active: currency?.active ?? true,
      isDefault: currency?.isDefault ?? false,
    },
  });

  const onSubmit = async (data: CompanyCurrencyFormValues) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const response = isEditMode && currency
        ? await updateCurrency(currency.id, data)
        : await createCurrency(data);

      if (!response.success) {
        toast(response.error || `Failed to ${isEditMode ? 'update' : 'create'} currency`);
        return;
      }

      toast(`Currency ${isEditMode ? 'updated' : 'created'} successfully`);
      form.reset();
      onSuccess?.();
      router.refresh();
    } catch {
      toast('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        control={form.control}
        name="currency"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Currency Code*</FieldLabel>
            <Input {...field} placeholder="e.g. USD, EUR, TND" maxLength={3} />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="name"
        render={({ field }) => (
          <Field><FieldLabel>Currency Name</FieldLabel><Input {...field} placeholder="e.g. US Dollar, Euro" /></Field>
        )}
      />

      <Controller
        control={form.control}
        name="active"
        render={({ field }) => (
          <Field className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5"><FieldLabel>Active</FieldLabel><FieldDescription>Enable this currency for use</FieldDescription></div>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="isDefault"
        render={({ field }) => (
          <Field className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FieldLabel>Default Currency</FieldLabel>
              <FieldDescription>Set as the primary currency for this company</FieldDescription>
            </div>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </Field>
        )}
      />
    </form>
  );
}
