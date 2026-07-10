import * as z from 'zod';

export const customerTypeFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  active: z.boolean().default(true),
});

export type CustomerTypeFormValues = z.infer<typeof customerTypeFormSchema>;

export type CustomerTypeRecord = {
  id: string;
  name: string;
  active: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
};
