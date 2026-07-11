'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { createEmployee, updateEmployee } from './actions';
import { employeeFormSchema, EmployeeFormValues, EmployeeRecord } from './schema';
import { handleNumberInput } from '@/lib/utils';

interface EmployeeFormProps {
  onSuccess: () => void;
  formRef: React.RefObject<HTMLFormElement>;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  employee?: EmployeeRecord;
}

export function EmployeeForm({ onSuccess, formRef, isSubmitting, setIsSubmitting, employee }: EmployeeFormProps) {
  const router = useRouter();
  const isEditMode = !!employee;
  const form = useForm({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      displayName: employee?.displayName || '',
      title: employee?.title || '',
      givenName: employee?.givenName || '',
      familyName: employee?.familyName || '',
      primaryEmail: employee?.primaryEmail || '',
      primaryPhone: employee?.primaryPhone || '',
      mobilePhone: employee?.mobilePhone || '',
      employeeNumber: employee?.employeeNumber || '',
      billableTime: employee?.billableTime ?? false,
      billRate: employee?.billRate ?? undefined,
      isActive: employee?.isActive ?? true,
    },
  });

  const onSubmit = async (data: EmployeeFormValues) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const response = isEditMode && employee ? await updateEmployee(employee.id, data) : await createEmployee(data);
      if (!response.success) { toast(response.error || 'Failed'); return; }
      toast(`Employee ${isEditMode ? 'updated' : 'created'} successfully`);
      form.reset(); onSuccess?.(); router.refresh();
    } catch { toast('An unexpected error occurred'); } finally { setIsSubmitting(false); }
  };

  return (
    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Controller control={form.control} name="displayName" render={({ field, fieldState }) => (
          <Field><FieldLabel>Display Name*</FieldLabel><Input {...field} placeholder="Full name" />{fieldState.error && <FieldError errors={[fieldState.error]} />}</Field>
        )} />
        <Controller control={form.control} name="title" render={({ field }) => (
          <Field><FieldLabel>Title</FieldLabel><Input {...field} placeholder="e.g. Manager" /></Field>
        )} />
        <Controller control={form.control} name="givenName" render={({ field }) => (
          <Field><FieldLabel>Given Name</FieldLabel><Input {...field} /></Field>
        )} />
        <Controller control={form.control} name="familyName" render={({ field }) => (
          <Field><FieldLabel>Family Name</FieldLabel><Input {...field} /></Field>
        )} />
        <Controller control={form.control} name="primaryEmail" render={({ field, fieldState }) => (
          <Field><FieldLabel>Email</FieldLabel><Input {...field} type="email" />{fieldState.error && <FieldError errors={[fieldState.error]} />}</Field>
        )} />
        <Controller control={form.control} name="primaryPhone" render={({ field }) => (
          <Field><FieldLabel>Phone</FieldLabel><Input {...field} /></Field>
        )} />
        <Controller control={form.control} name="mobilePhone" render={({ field }) => (
          <Field><FieldLabel>Mobile</FieldLabel><Input {...field} /></Field>
        )} />
        <Controller control={form.control} name="employeeNumber" render={({ field }) => (
          <Field><FieldLabel>Employee #</FieldLabel><Input {...field} /></Field>
        )} />
        <Controller control={form.control} name="ssn" render={({ field }) => (
          <Field><FieldLabel>SSN</FieldLabel><Input {...field} placeholder="Social Security Number" /></Field>
        )} />
        <Controller control={form.control} name="printOnCheckName" render={({ field }) => (
          <Field><FieldLabel>Print on Check</FieldLabel><Input {...field} placeholder="Name to print on checks" /></Field>
        )} />
      </div>
      <Controller control={form.control} name="costRate" render={({ field }) => (
        <Field><FieldLabel>Cost Rate</FieldLabel>
          <Input type="number" min="0" step="0.01" value={field.value ?? ''} onChange={e => handleNumberInput(e.target.value, field.onChange, 0)} />
        </Field>
      )} />
      <Controller control={form.control} name="billRate" render={({ field }) => (
        <Field><FieldLabel>Bill Rate</FieldLabel>
          <Input type="number" min="0" step="0.01" value={field.value ?? ''} onChange={e => handleNumberInput(e.target.value, field.onChange, 0)} />
          <FieldDescription>Hourly bill rate for time tracking</FieldDescription>
        </Field>
      )} />
      <Controller control={form.control} name="billableTime" render={({ field }) => (
        <Field className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5"><FieldLabel>Billable Time</FieldLabel><FieldDescription>Track billable hours for this employee</FieldDescription></div>
          <Switch checked={field.value} onCheckedChange={field.onChange} />
        </Field>
      )} />
      <Controller control={form.control} name="isActive" render={({ field }) => (
        <Field className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5"><FieldLabel>Active</FieldLabel><FieldDescription>Disable to hide this employee</FieldDescription></div>
          <Switch checked={field.value} onCheckedChange={field.onChange} />
        </Field>
      )} />
    </form>
  );
}
