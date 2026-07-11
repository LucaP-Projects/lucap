import * as z from 'zod';

export const employeeFormSchema = z.object({
  displayName: z.string().min(1, 'Name is required').max(200),
  title: z.string().optional(),
  givenName: z.string().optional(),
  familyName: z.string().optional(),
  primaryEmail: z.string().email().optional().or(z.literal('')),
  primaryPhone: z.string().optional(),
  mobilePhone: z.string().optional(),
  employeeNumber: z.string().optional(),
  ssn: z.string().optional(),
  costRate: z.number().min(0).optional(),
  billableTime: z.boolean().default(false),
  billRate: z.number().min(0).optional(),
  printOnCheckName: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type EmployeeFormValues = z.input<typeof employeeFormSchema>;

export type EmployeeRecord = {
  id: string;
  displayName: string;
  title: string | null;
  givenName: string | null;
  familyName: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
  mobilePhone: string | null;
  employeeNumber: string | null;
  ssn: string | null;
  costRate: number | null;
  billableTime: boolean;
  billRate: number | null;
  printOnCheckName: string | null;
  hiredDate: Date | null;
  isActive: boolean;
  companyId: string;
};
