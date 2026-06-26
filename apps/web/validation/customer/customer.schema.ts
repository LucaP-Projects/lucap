import { z } from 'zod';

export const AddressSchema = z.object({
  line1: z.string().min(1).max(100),
  line2: z.string().max(100).optional(),
  city: z.string().min(1).max(50),
  state: z.string().min(1).max(50),
  postalCode: z.string().min(1).max(20),
  country: z.string().min(1).max(50)
});

export const CustomerMetadataSchema = z.object({
  industry: z.string().optional(),
  marketingPreferences: z
    .object({
      emailOptIn: z.boolean(),
      smsOptIn: z.boolean()
    })
    .optional(),
  customFields: z.record(z.string(), z.string()).optional(),
  tags: z.array(z.string()).optional()
});

// Main customer schema
export const CustomerSchema = z.object({
  displayName: z.string().min(1).max(500),
  title: z.string().max(16).optional(),
  givenName: z.string().min(1).max(100).optional(),
  middleName: z.string().max(100).optional(),
  familyName: z.string().min(1).max(100).optional(),
  suffix: z.string().max(16).optional(),
  companyName: z.string().max(100).optional(),
  primaryPhone: z
    .string()
    .regex(/^[+]{0,1}\d{3}\d{3}\d{4}$/)
    .max(30)
    .optional(),
  alternatePhone: z
    .string()
    .regex(/^[+]{0,1}\d{3}\d{3}\d{4}$/)
    .max(30)
    .optional(),
  mobile: z.string().max(30).optional(),
  fax: z.string().max(30).optional(),
  primaryEmail: z.email().optional(),
  webAddress: z.string().url().max(1000).optional(),
  printOnCheckName: z.string().max(500).optional(),
  billingAddress: AddressSchema.optional(),
  shippingAddress: AddressSchema.optional(),
  taxIdentifier: z.string().optional(),
  secondaryTaxId: z.string().optional(),
  resaleNumber: z.string().max(16).optional(),
  businessNumber: z.string().max(10).optional(),
  notes: z.string().max(2000).optional(),
  balance: z.number().default(0),
  creditLimit: z.number().optional(),
  preferredPaymentMethod: z.enum(['PRINT', 'EMAIL', 'NONE']).optional(),
  taxable: z.boolean().default(true),
  level: z.number().min(0).max(4).default(0),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  metadata: CustomerMetadataSchema.optional(),
  parentId: z.string().optional(),
  isSubcustomer: z.boolean().default(false),
  shippingAddressSameAsBilling: z.boolean().default(true),
  billParentCustomer: z.boolean().default(false)
});
