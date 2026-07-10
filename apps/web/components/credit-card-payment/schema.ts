import * as z from 'zod';
export const ccPaymentFormSchema = z.object({
  txnDate: z.string().min(1, 'Date is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  bankAccountId: z.string().min(1, 'Bank account is required'),
  creditCardAccountId: z.string().min(1, 'Credit card account is required'),
  vendorId: z.string().optional(),
  privateNote: z.string().optional(),
});
export type CCPaymentFormValues = z.input<typeof ccPaymentFormSchema>;
export type CCPaymentRecord = { id: string; txnDate: Date; amount: number; bankAccountId: string; creditCardAccountId: string; vendorId: string | null; privateNote: string | null; companyId: string; createdAt: Date };
