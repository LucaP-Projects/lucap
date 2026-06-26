'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, Form, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { TaxRate } from '@/lib/generated/prisma/browser';
import { TaxType } from '@/lib/generated/prisma/enums';
import { handleNumberInput } from '@/lib/utils';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { createTax, updateTax } from './action';
import { taxFormSchema, TaxFormValues } from './schema';

interface TaxFormProps {
  onSuccess: (newTax?: TaxRate) => void;
  formRef: React.RefObject<HTMLFormElement | null>;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  isNestedForm?: boolean;
  editData?: {
    id: string;
    name: string;
    description: string | null;
    agencyName: string;
    type: string;
    rate: number;
  } | null;
}

export function TaxForm({
  onSuccess,
  formRef,
  isSubmitting,
  setIsSubmitting,
  isNestedForm = false,
  editData
}: TaxFormProps) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(taxFormSchema),
    defaultValues: {
      name: editData?.name || '',
      description: editData?.description || '',
      agencyName: editData?.agencyName || '',
      type: (editData?.type as TaxType) || TaxType.SALES,
      rate: editData?.rate || 0
    }
  });

  const onSubmit = async (data: TaxFormValues) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const response = editData
        ? await updateTax(editData.id, data)
        : await createTax(data);

      if (!response.success) {
        toast.error(
          response.error ||
          `Failed to ${editData ? 'update' : 'create'} tax rate`
        );
        return;
      }

      toast.success(`Tax rate ${editData ? 'updated' : 'created'} successfully`);
      form.reset();
      onSuccess?.(response.data);
      router.refresh();
    } catch (error) {
      console.error(
        `Error ${editData ? 'updating' : 'creating'} tax rate:`,
        error
      );
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (isNestedForm) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Name*</FieldLabel>
              <Input {...field} placeholder="Enter tax rate name" />
              {fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                {...field}
                placeholder="Enter tax rate description"
                className="resize-none"
              />
              {fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="agencyName"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Tax Agency*</FieldLabel>
              <Input {...field} placeholder="Enter tax agency name" />
              {fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="type"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Tax Type*</FieldLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tax type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaxType.SALES}>Sales Tax</SelectItem>
                  <SelectItem value={TaxType.VAT}>VAT</SelectItem>
                  <SelectItem value={TaxType.GST}>GST</SelectItem>
                  <SelectItem value={TaxType.SERVICE}>Service Tax</SelectItem>
                  <SelectItem value={TaxType.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="rate"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Rate (%)*</FieldLabel>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                onChange={(e) =>
                  handleNumberInput(e.target.value, field.onChange)
                }
                value={field.value}
              />

              {fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </form>
    </Form>
  );
}
