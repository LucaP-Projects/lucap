'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { createCustomerType, updateCustomerType } from './actions';
import { customerTypeFormSchema, CustomerTypeFormValues, CustomerTypeRecord } from './schema';

interface CustomerTypeFormProps {
  onSuccess: () => void;
  formRef: React.RefObject<HTMLFormElement>;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  customerType?: CustomerTypeRecord;
}

export function CustomerTypeForm({
  onSuccess,
  formRef,
  isSubmitting,
  setIsSubmitting,
  customerType,
}: CustomerTypeFormProps) {
  const router = useRouter();
  const isEditMode = !!customerType;

  const form = useForm({
    resolver: zodResolver(customerTypeFormSchema),
    defaultValues: {
      name: customerType?.name || '',
      active: customerType?.active ?? true,
    },
  });

  const onSubmit = async (data: CustomerTypeFormValues) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const response = isEditMode && customerType
        ? await updateCustomerType(customerType.id, data)
        : await createCustomerType(data);

      if (!response.success) {
        toast(response.error || `Failed to ${isEditMode ? 'update' : 'create'} customer type`);
        return;
      }

      toast(`Customer type ${isEditMode ? 'updated' : 'created'} successfully`);
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
            <Input {...field} placeholder="Enter customer type name" />
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
              <FieldDescription>Disable to hide this type from lists</FieldDescription>
            </div>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </Field>
        )}
      />
    </form>
  );
}
