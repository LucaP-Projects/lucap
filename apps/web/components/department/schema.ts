import * as z from 'zod';

export const departmentFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  parentId: z.string().optional(),
  active: z.boolean().default(true),
});

export type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

export type DepartmentRecord = {
  id: string;
  name: string;
  fullyQualifiedName: string | null;
  parentId: string | null;
  active: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  parent?: { id: string; name: string } | null;
  children?: DepartmentRecord[];
};
