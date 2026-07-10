'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { createTaxAgency, updateTaxAgency } from './actions';
import { taxAgencyFormSchema, TaxAgencyFormValues, TaxAgencyRecord } from './schema';

interface TaxAgencyFormProps {
  onSuccess: () => void;
  formRef: React.RefObject<HTMLFormElement>;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  agency?: TaxAgencyRecord;
}

export function TaxAgencyForm({ onSuccess, formRef, isSubmitting, setIsSubmitting, agency }: TaxAgencyFormProps) {
  const router = useRouter();
  const isEditMode = !!agency;
  const form = useForm({
    resolver: zodResolver(taxAgencyFormSchema),
    defaultValues: {
      name: agency?.name || '',
      registrationNumber: agency?.registrationNumber || '',
      taxTrackedOnSales: agency?.taxTrackedOnSales ?? true,
      taxTrackedOnPurchases: agency?.taxTrackedOnPurchases ?? true,
    },
  });

  const onSubmit = async (data: TaxAgencyFormValues) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const response = isEditMode && agency
        ? await updateTaxAgency(agency.id, data)
        : await createTaxAgency(data);
      if (!response.success) {
        toast(response.error || `Failed to ${isEditMode ? 'update' : 'create'} tax agency`);
        return;
      }
      toast(`Tax agency ${isEditMode ? 'updated' : 'created'} successfully`);
      form.reset();
      onSuccess?.();
      router.refresh();
    } catch { toast('An unexpected error occurred'); } finally { setIsSubmitting(false); }
  };

  return (
    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Controller control={form.control} name="name" render={({ field, fieldState }) => (
        <Field><FieldLabel>Name*</FieldLabel><Input {...field} placeholder="e.g. Ministere des Finances" />{fieldState.error && <FieldError errors={[fieldState.error]} />}</Field>
      )} />
      <Controller control={form.control} name="registrationNumber" render={({ field }) => (
        <Field><FieldLabel>Registration Number</FieldLabel><Input {...field} placeholder="e.g. TVA intracommunautaire" /></Field>
      )} />
      <Controller control={form.control} name="taxTrackedOnSales" render={({ field }) => (
        <Field className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5"><FieldLabel>Track on Sales</FieldLabel><FieldDescription>Apply this agency's tax to sales transactions</FieldDescription></div>
          <Switch checked={field.value} onCheckedChange={field.onChange} />
        </Field>
      )} />
      <Controller control={form.control} name="taxTrackedOnPurchases" render={({ field }) => (
        <Field className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5"><FieldLabel>Track on Purchases</FieldLabel><FieldDescription>Apply this agency's tax to purchase transactions</FieldDescription></div>
          <Switch checked={field.value} onCheckedChange={field.onChange} />
        </Field>
      )} />
    </form>
  );
}
