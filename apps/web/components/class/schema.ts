import * as z from 'zod';

export const classFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  parentId: z.string().optional(),
  active: z.boolean().default(true),
});

export type ClassFormValues = z.infer<typeof classFormSchema>;

export type ClassRecord = {
  id: string;
  name: string;
  fullyQualifiedName: string | null;
  parentId: string | null;
  active: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  parent?: { id: string; name: string } | null;
  children?: ClassRecord[];
};
