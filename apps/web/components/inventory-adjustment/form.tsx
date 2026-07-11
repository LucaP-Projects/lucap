'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { createAdjustment } from './actions';
import { adjustmentFormSchema, AdjustmentFormValues } from './schema';
import { handleNumberInput } from '@/lib/utils';

interface AdjustmentFormProps {
  onSuccess: () => void;
  formRef: React.RefObject<HTMLFormElement>;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}

export function AdjustmentForm({ onSuccess, formRef, isSubmitting, setIsSubmitting }: AdjustmentFormProps) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(adjustmentFormSchema),
    defaultValues: { docNumber: '', itemId: '', quantity: 0, adjustAccountId: '', privateNote: '', date: new Date().toISOString().split('T')[0] },
  });

  const onSubmit = async (data: AdjustmentFormValues) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const response = await createAdjustment(data);
      if (!response.success) { toast(response.error || 'Failed'); return; }
      toast('Adjustment created');
      form.reset(); onSuccess?.(); router.refresh();
    } catch { toast('Error'); } finally { setIsSubmitting(false); }
  };

  return (
    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Controller control={form.control} name="docNumber" render={({ field }) => (
        <Field><FieldLabel>Doc Number</FieldLabel><Input {...field} placeholder="e.g. ADJ-001" /></Field>
      )} />
      <Controller control={form.control} name="itemId" render={({ field, fieldState }) => (
        <Field><FieldLabel>Item ID*</FieldLabel><Input {...field} placeholder="Item ID" />{fieldState.error && <FieldError errors={[fieldState.error]} />}</Field>
      )} />
      <Controller control={form.control} name="quantity" render={({ field, fieldState }) => (
        <Field><FieldLabel>Quantity*</FieldLabel>
          <Input type="number" value={field.value} onChange={e => handleNumberInput(e.target.value, field.onChange, 0)} />
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )} />
      <Controller control={form.control} name="adjustAccountId" render={({ field }) => (
        <Field><FieldLabel>Adjust Account ID</FieldLabel><Input {...field} placeholder="Account ID for inventory shrinkage" /></Field>
      )} />
      <Controller control={form.control} name="privateNote" render={({ field }) => (
        <Field><FieldLabel>Note</FieldLabel><Input {...field} placeholder="Reason for adjustment" /></Field>
      )} />
      <Controller control={form.control} name="date" render={({ field, fieldState }) => (
        <Field><FieldLabel>Date*</FieldLabel><Input type="date" {...field} />{fieldState.error && <FieldError errors={[fieldState.error]} />}</Field>
      )} />
    </form>
  );
}
