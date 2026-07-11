'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { createCCPayment } from './actions';
import { ccPaymentFormSchema, CCPaymentFormValues } from './schema';
import { handleNumberInput } from '@/lib/utils';

interface CCPaymentFormProps { onSuccess: () => void; formRef: React.RefObject<HTMLFormElement>; isSubmitting: boolean; setIsSubmitting: (v: boolean) => void; }

export function CCPaymentForm({ onSuccess, formRef, isSubmitting, setIsSubmitting }: CCPaymentFormProps) {
  const router = useRouter();
  const form = useForm({ resolver: zodResolver(ccPaymentFormSchema), defaultValues: { txnDate: new Date().toISOString().split('T')[0], amount: 0, bankAccountId: '', creditCardAccountId: '', vendorId: '', privateNote: '' } });
  const onSubmit = async (data: CCPaymentFormValues) => {
    if (isSubmitting) return;
    try { setIsSubmitting(true); const r = await createCCPayment(data); if (!r.success) { toast(r.error || 'Failed'); return; } toast('Payment created'); form.reset(); onSuccess?.(); router.refresh(); }
    catch { toast('Error'); } finally { setIsSubmitting(false); }
  };
  return (
    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Controller control={form.control} name="txnDate" render={({ field, fieldState }) => (<Field><FieldLabel>Date*</FieldLabel><Input type="date" {...field} />{fieldState.error && <FieldError errors={[fieldState.error]} />}</Field>)} />
      <Controller control={form.control} name="amount" render={({ field, fieldState }) => (<Field><FieldLabel>Amount*</FieldLabel><Input type="number" min="0" step="0.01" value={field.value || ''} onChange={e => handleNumberInput(e.target.value, field.onChange, 0)} />{fieldState.error && <FieldError errors={[fieldState.error]} />}</Field>)} />
      <Controller control={form.control} name="bankAccountId" render={({ field, fieldState }) => (<Field><FieldLabel>Bank Account*</FieldLabel><Input {...field} placeholder="Account ID" />{fieldState.error && <FieldError errors={[fieldState.error]} />}</Field>)} />
      <Controller control={form.control} name="creditCardAccountId" render={({ field, fieldState }) => (<Field><FieldLabel>Credit Card Account*</FieldLabel><Input {...field} placeholder="Account ID" />{fieldState.error && <FieldError errors={[fieldState.error]} />}</Field>)} />
      <Controller control={form.control} name="privateNote" render={({ field }) => (<Field><FieldLabel>Note</FieldLabel><Input {...field} /></Field>)} />
    </form>
  );
}
