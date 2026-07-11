'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { createTransfer } from './actions';
import { transferFormSchema, TransferFormValues } from './schema';
import { handleNumberInput } from '@/lib/utils';

interface TransferFormProps { onSuccess: () => void; formRef: React.RefObject<HTMLFormElement>; isSubmitting: boolean; setIsSubmitting: (v: boolean) => void; }

export function TransferForm({ onSuccess, formRef, isSubmitting, setIsSubmitting }: TransferFormProps) {
  const router = useRouter();
  const form = useForm({ resolver: zodResolver(transferFormSchema), defaultValues: { amount: 0, transferDate: new Date().toISOString().split('T')[0], fromAccountId: '', toAccountId: '', memo: '' } });
  const onSubmit = async (data: TransferFormValues) => {
    if (isSubmitting) return;
    try { setIsSubmitting(true); const r = await createTransfer(data); if (!r.success) { toast(r.error || 'Failed'); return; } toast('Transfer created'); form.reset(); onSuccess?.(); router.refresh(); }
    catch { toast('Error'); } finally { setIsSubmitting(false); }
  };
  return (
    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Controller control={form.control} name="amount" render={({ field, fieldState }) => (<Field><FieldLabel>Amount*</FieldLabel><Input type="number" min="0" step="0.01" value={field.value || ''} onChange={e => handleNumberInput(e.target.value, field.onChange, 0)} />{fieldState.error && <FieldError errors={[fieldState.error]} />}</Field>)} />
      <Controller control={form.control} name="transferDate" render={({ field, fieldState }) => (<Field><FieldLabel>Date*</FieldLabel><Input type="date" {...field} />{fieldState.error && <FieldError errors={[fieldState.error]} />}</Field>)} />
      <Controller control={form.control} name="fromAccountId" render={({ field, fieldState }) => (<Field><FieldLabel>From Account*</FieldLabel><Input {...field} placeholder="Account ID" />{fieldState.error && <FieldError errors={[fieldState.error]} />}</Field>)} />
      <Controller control={form.control} name="toAccountId" render={({ field, fieldState }) => (<Field><FieldLabel>To Account*</FieldLabel><Input {...field} placeholder="Account ID" />{fieldState.error && <FieldError errors={[fieldState.error]} />}</Field>)} />
      <Controller control={form.control} name="memo" render={({ field }) => (<Field><FieldLabel>Memo</FieldLabel><Input {...field} /></Field>)} />
    </form>
  );
}
