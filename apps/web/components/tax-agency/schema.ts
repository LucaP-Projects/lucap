import * as z from 'zod';

export const taxAgencyFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  registrationNumber: z.string().optional(),
  taxTrackedOnSales: z.boolean().default(true),
  taxTrackedOnPurchases: z.boolean().default(true),
});

export type TaxAgencyFormValues = z.infer<typeof taxAgencyFormSchema>;

export type TaxAgencyRecord = {
  id: string;
  name: string;
  registrationNumber: string | null;
  taxTrackedOnSales: boolean;
  taxTrackedOnPurchases: boolean;
  companyId: string;
};
