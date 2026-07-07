'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { paymentFormSchema } from './schema';

export function usePaymentForm() {
  return useForm({
    resolver: zodResolver(paymentFormSchema),
    mode: 'onChange',
    defaultValues: {
      customerId: '',
      invoiceIds: [],
      amount: 0,
      paymentDate: new Date(),
      paymentMethod: 'CASH',
      reference: '',
      notes: ''
    }
  });
}
