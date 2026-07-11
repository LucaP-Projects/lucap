import * as z from 'zod';

export const timeActivityFormSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  customerId: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  duration: z.number().min(0, 'Duration must be positive'),
  description: z.string().optional(),
  billable: z.boolean().default(true),
  hourlyRate: z.number().min(0).optional(),
});

export type TimeActivityFormValues = z.input<typeof timeActivityFormSchema>;

export type TimeActivityRecord = {
  id: string;
  employeeId: string;
  customerId: string | null;
  date: Date;
  duration: number;
  description: string | null;
  billable: boolean;
  hourlyRate: number | null;
  companyId: string;
};

export type TimeActivityWithRelations = TimeActivityRecord & {
  employee: { id: string; displayName: string };
  customer?: { id: string; displayName: string } | null;
};
