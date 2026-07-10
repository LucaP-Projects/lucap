import * as z from 'zod';

export const taxCodeFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  taxGroup: z.boolean().default(false),
  taxable: z.boolean().default(true),
  active: z.boolean().default(true),
});

export type TaxCodeFormValues = z.infer<typeof taxCodeFormSchema>;

export type TaxCodeRecord = {
  id: string;
  name: string;
  description: string | null;
  taxGroup: boolean;
  taxable: boolean;
  active: boolean;
  companyId: string;
};
