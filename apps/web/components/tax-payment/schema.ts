import * as z from 'zod';
export const taxPaymentFormSchema = z.object({
  amount: z.number().min(0, 'Amount must be positive'),
  paymentDate: z.string().min(1, 'Date is required'),
  taxAgencyId: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});
export type TaxPaymentFormValues = z.input<typeof taxPaymentFormSchema>;
export type TaxPaymentRecord = { id: string; amount: number; paymentDate: Date; taxAgencyId: string | null; reference: string | null; notes: string | null; companyId: string; createdAt: Date };
