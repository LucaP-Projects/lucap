import { z } from 'zod';

export const paymentFormSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  invoiceIds: z.array(z.string()).min(1, 'Select at least one invoice'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.enum([
    'CASH',
    'CREDIT_CARD',
    'BANK_TRANSFER',
    'CHECK',
    'DIGITAL_WALLET',
    'MOBILE_PAYMENT',
    'OTHER'
  ]),
  paymentDate: z.date({
    required_error: 'Payment date is required'
  }),
  reference: z.string().optional(),
  notes: z.string().optional()
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
