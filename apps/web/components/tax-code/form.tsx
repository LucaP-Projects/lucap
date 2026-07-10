'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { createTaxCode, updateTaxCode } from './actions';
import { taxCodeFormSchema, TaxCodeFormValues, TaxCodeRecord } from './schema';

interface TaxCodeFormProps {
  onSuccess: () => void;
  formRef: React.RefObject<HTMLFormElement>;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  taxCode?: TaxCodeRecord;
}

export function TaxCodeForm({
  onSuccess,
  formRef,
  isSubmitting,
  setIsSubmitting,
  taxCode,
}: TaxCodeFormProps) {
  const router = useRouter();
  const isEditMode = !!taxCode;

  const form = useForm({
    resolver: zodResolver(taxCodeFormSchema),
    defaultValues: {
      name: taxCode?.name || '',
      description: taxCode?.description || '',
      taxGroup: taxCode?.taxGroup ?? false,
      taxable: taxCode?.taxable ?? true,
      active: taxCode?.active ?? true,
    },
  });

  const onSubmit = async (data: TaxCodeFormValues) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const response = isEditMode && taxCode
        ? await updateTaxCode(taxCode.id, data)
        : await createTaxCode(data);
      if (!response.success) {
        toast(response.error || `Failed to ${isEditMode ? 'update' : 'create'} tax code`);
        return;
      }
      toast(`Tax code ${isEditMode ? 'updated' : 'created'} successfully`);
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
            <Input {...field} placeholder="e.g. TVA 19%, EXEMPT" />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="description"
        render={({ field }) => (
          <Field><FieldLabel>Description</FieldLabel><Input {...field} placeholder="e.g. Standard Tunisian VAT rate" /></Field>
        )}
      />
      <Controller
        control={form.control}
        name="taxGroup"
        render={({ field }) => (
          <Field className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5"><FieldLabel>Tax Group</FieldLabel><FieldDescription>This code groups multiple tax rates</FieldDescription></div>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="taxable"
        render={({ field }) => (
          <Field className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FieldLabel>Taxable</FieldLabel>
              <FieldDescription>Marks transactions with this code as taxable</FieldDescription>
            </div>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
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
              <FieldDescription>Disable to hide this tax code from lists</FieldDescription>
            </div>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </Field>
        )}
      />
    </form>
  );
}
