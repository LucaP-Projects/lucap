import { CompanyType } from '@/lib/generated/prisma/enums';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { z } from 'zod';

export const addressSchema = z
  .object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional()
  })
  .optional();

export const createCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  companyType: z.enum(CompanyType).optional(),
  email: z.email('Invalid email address').optional().or(z.literal('')),
  taxId: z.string().optional().or(z.literal('')),
  phone: z
    .string()
    .refine(isValidPhoneNumber, { message: 'Invalid phone number' })
    .or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  address: addressSchema.default({}),
  logo: z.any().optional() // This will handle the File object
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const editCompanySchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  companyType: z.enum(CompanyType).optional(),
  email: z.email('Invalid email address').optional().or(z.literal('')),
  taxId: z.string().optional().or(z.literal('')),
  phone: z
    .string()
    .refine(isValidPhoneNumber, { message: 'Invalid phone number' })
    .or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  address: addressSchema.default({}),
  logo: z.any().optional() // This will handle the File object
});

export type EditCompanyInput = z.infer<typeof editCompanySchema>;

// Type for the response from the server
export type CompanyResponse = {
  id: string;
  name: string;
  logo: string | null;
  companyType: CompanyType | null;
  email: string | null;
  taxId: string | null;
  phone: string | null;
  website: string | null;
  address: z.infer<typeof addressSchema> | null;
  isActive: boolean;
};
