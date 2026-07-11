'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { createDeposit } from './actions';
import { depositFormSchema, DepositFormValues } from './schema';
import { handleNumberInput } from '@/lib/utils';

interface DepositFormProps { onSuccess: () => void; formRef: React.RefObject<HTMLFormElement>; isSubmitting: boolean; setIsSubmitting: (v: boolean) => void; }

export function DepositForm({ onSuccess, formRef, isSubmitting, setIsSubmitting }: DepositFormProps) {
  const router = useRouter();
  const form = useForm({ resolver: zodResolver(depositFormSchema), defaultValues: { depositNumber: '', amount: 0, depositDate: new Date().toISOString().split('T')[0], memo: '' } });
  const onSubmit = async (data: DepositFormValues) => {
    if (isSubmitting) return;
    try { setIsSubmitting(true); const r = await createDeposit(data); if (!r.success) { toast(r.error || 'Failed'); return; } toast('Deposit created'); form.reset(); onSuccess?.(); router.refresh(); }
    catch { toast('Error'); } finally { setIsSubmitting(false); }
  };
  return (
    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Controller control={form.control} name="depositNumber" render={({ field }) => (<Field><FieldLabel>Deposit #</FieldLabel><Input {...field} placeholder="e.g. DEP-001" /></Field>)} />
      <Controller control={form.control} name="amount" render={({ field, fieldState }) => (<Field><FieldLabel>Amount*</FieldLabel><Input type="number" min="0" step="0.01" value={field.value || ''} onChange={e => handleNumberInput(e.target.value, field.onChange, 0)} />{fieldState.error && <FieldError errors={[fieldState.error]} />}</Field>)} />
      <Controller control={form.control} name="depositDate" render={({ field, fieldState }) => (<Field><FieldLabel>Date*</FieldLabel><Input type="date" {...field} />{fieldState.error && <FieldError errors={[fieldState.error]} />}</Field>)} />
      <Controller control={form.control} name="memo" render={({ field }) => (<Field><FieldLabel>Memo</FieldLabel><Input {...field} /></Field>)} />
    </form>
  );
}
