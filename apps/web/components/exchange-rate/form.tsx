'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { createExchangeRate, updateExchangeRate } from './actions';
import { exchangeRateFormSchema, ExchangeRateFormValues, ExchangeRateRecord } from './schema';
import { handleNumberInput } from '@/lib/utils';

interface ExchangeRateFormProps {
  onSuccess: () => void;
  formRef: React.RefObject<HTMLFormElement>;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  rate?: ExchangeRateRecord;
}

export function ExchangeRateForm({
  onSuccess,
  formRef,
  isSubmitting,
  setIsSubmitting,
  rate,
}: ExchangeRateFormProps) {
  const router = useRouter();
  const isEditMode = !!rate;

  const form = useForm({
    // @ts-expect-error Zod v4 + hookform/resolvers type incompatibility
    resolver: zodResolver(exchangeRateFormSchema),
    defaultValues: {
      sourceCurrency: rate?.sourceCurrency || '',
      targetCurrency: rate?.targetCurrency || '',
      rate: rate?.rate ?? 0,
      asOfDate: rate?.asOfDate ? new Date(rate.asOfDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: ExchangeRateFormValues) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const response = isEditMode && rate
        ? await updateExchangeRate(rate.id, data)
        : await createExchangeRate(data);

      if (!response.success) {
        toast(response.error || `Failed to ${isEditMode ? 'update' : 'create'} exchange rate`);
        return;
      }

      toast(`Exchange rate ${isEditMode ? 'updated' : 'created'} successfully`);
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
        name="sourceCurrency"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Source Currency*</FieldLabel>
            <Input {...field} placeholder="e.g. USD" maxLength={3} />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="targetCurrency"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Target Currency*</FieldLabel>
            <Input {...field} placeholder="e.g. TND" maxLength={3} />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="rate"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Exchange Rate*</FieldLabel>
            <Input
              type="number" min="0" step="0.0001"
              placeholder="e.g. 3.05"
              onChange={(e) => handleNumberInput(e.target.value, field.onChange, 0)}
              value={field.value ?? ''}
            />
            <FieldDescription>1 source currency = rate in target currency</FieldDescription>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="asOfDate"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Effective Date*</FieldLabel>
            <Input type="date" {...field} />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </form>
  );
}
