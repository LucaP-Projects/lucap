'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createBudget } from './actions';
import { budgetFormSchema, BudgetFormValues, BudgetRecord } from './schema';
import { getReportFilters } from '@/app/(app)/[company-slug]/reports/actions';
import { handleNumberInput } from '@/lib/utils';

interface BudgetFormProps {
  onSuccess: () => void;
  formRef: React.RefObject<HTMLFormElement>;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  budget?: BudgetRecord;
}

export function BudgetForm({ onSuccess, formRef, isSubmitting, setIsSubmitting, budget }: BudgetFormProps) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    getReportFilters().then(f => setAccounts(f.accounts)).catch(() => {});
  }, []);

  const form = useForm({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      name: '',
      budgetType: 'ANNUAL',
      fiscalYear: new Date().getFullYear(),
      entries: [{ accountId: '', amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'entries' });

  const onSubmit = async (data: BudgetFormValues) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const response = await createBudget(data);
      if (!response.success) { toast(response.error || 'Failed to create budget'); return; }
      toast('Budget created successfully');
      form.reset();
      onSuccess?.();
      router.refresh();
    } catch { toast('An unexpected error occurred'); } finally { setIsSubmitting(false); }
  };

  return (
    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Controller control={form.control} name="name" render={({ field, fieldState }) => (
        <Field><FieldLabel>Budget Name*</FieldLabel><Input {...field} placeholder="e.g. FY 2026 Operating Budget" />{fieldState.error && <FieldError errors={[fieldState.error]} />}</Field>
      )} />
      <Controller control={form.control} name="budgetType" render={({ field }) => (
        <Field><FieldLabel>Budget Type</FieldLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ANNUAL">Annual</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="QUARTERLY">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      )} />
      <Controller control={form.control} name="fiscalYear" render={({ field, fieldState }) => (
        <Field><FieldLabel>Fiscal Year*</FieldLabel>
          <Input type="number" min="2000" max="2100" value={field.value} onChange={e => field.onChange(parseInt(e.target.value) || new Date().getFullYear())} />
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )} />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Budget Entries</span>
          <Button type="button" variant="outline" size="sm" onClick={() => append({ accountId: '', amount: 0 })}><Plus className="mr-1 h-3 w-3" />Add Account</Button>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-end gap-2">
            <div className="flex-1">
              <Controller control={form.control} name={`entries.${index}.accountId`} render={({ field: f }) => (
                <Field><FieldLabel>Account</FieldLabel>
                  <Select onValueChange={f.onChange} value={f.value}>
                    <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                    <SelectContent>
                      {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              )} />
            </div>
            <div className="w-32">
              <Controller control={form.control} name={`entries.${index}.amount`} render={({ field: f }) => (
                <Field><FieldLabel>Amount</FieldLabel>
                  <Input type="number" min="0" step="0.01" value={f.value || ''} onChange={e => handleNumberInput(e.target.value, f.onChange, 0)} />
                </Field>
              )} />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => fields.length > 1 && remove(index)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        {form.formState.errors.entries && <p className="text-sm text-red-500">{form.formState.errors.entries.message || form.formState.errors.entries.root?.message}</p>}
      </div>
    </form>
  );
}
