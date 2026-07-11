'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { createTerm, updateTerm } from './actions';
import { termFormSchema, TermFormValues, TermRecord } from './schema';
import { handleNumberInput } from '@/lib/utils';

interface TermFormProps {
  onSuccess: () => void;
  formRef: React.RefObject<HTMLFormElement>;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  term?: TermRecord;
}

export function TermForm({
  onSuccess,
  formRef,
  isSubmitting,
  setIsSubmitting,
  term,
}: TermFormProps) {
  const router = useRouter();
  const isEditMode = !!term;

  const form = useForm({
    resolver: zodResolver(termFormSchema),
    defaultValues: {
      name: term?.name || '',
      dueDays: term?.dueDays ?? undefined,
      discountDays: term?.discountDays ?? undefined,
      discountPercent: term?.discountPercent ?? undefined,
      active: term?.active ?? true,
    },
  });

  const onSubmit = async (data: TermFormValues) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const response = isEditMode && term
        ? await updateTerm(term.id, data)
        : await createTerm(data);

      if (!response.success) {
        toast(response.error || `Failed to ${isEditMode ? 'update' : 'create'} term`);
        return;
      }

      toast(`Term ${isEditMode ? 'updated' : 'created'} successfully`);
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
        name="name"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Name*</FieldLabel>
            <Input {...field} placeholder="e.g. Net 30, 2% 15 Net 60" />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="dueDays"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Due Days</FieldLabel>
            <Input
              type="number" min="0" step="1"
              placeholder="e.g. 30"
              onChange={(e) => handleNumberInput(e.target.value, field.onChange, 0)}
              value={field.value ?? ''}
            />
            <FieldDescription>Number of days until payment is due</FieldDescription>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="discountDays"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Discount Days</FieldLabel>
            <Input
              type="number" min="0" step="1"
              placeholder="e.g. 15"
              onChange={(e) => handleNumberInput(e.target.value, field.onChange, 0)}
              value={field.value ?? ''}
            />
            <FieldDescription>Number of days to qualify for discount</FieldDescription>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="discountPercent"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Discount Percent</FieldLabel>
            <Input
              type="number" min="0" max="100" step="0.01"
              placeholder="e.g. 2"
              onChange={(e) => handleNumberInput(e.target.value, field.onChange, 0)}
              value={field.value ?? ''}
            />
            <FieldDescription>Percentage discount if paid within discount days</FieldDescription>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="active"
        render={({ field }) => (
          <Field className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FieldLabel>Active</FieldLabel>
              <FieldDescription>Disable to hide this term from lists</FieldDescription>
            </div>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </Field>
        )}
      />
    </form>
  );
}