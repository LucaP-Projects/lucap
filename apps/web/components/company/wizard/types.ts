import { z } from 'zod';
import { CompanyType } from '@/lib/generated/prisma/enums';

export const companyInfoSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  taxId: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
  address: z.object({
    line1: z.string().optional().or(z.literal('')),
    line2: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    postalCode: z.string().optional().or(z.literal('')),
    country: z.string().optional().or(z.literal('')),
  }),
  taxRegime: z.enum(['REEL', 'FORFAIT']),
  vatRegime: z.enum(['MENSUEL', 'TRIMESTRIEL']),
});

export const shareholderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  shares: z.number().min(1, 'Must have at least 1 share'),
  role: z.string().optional().or(z.literal('')),
});

export const capitalSchema = z.object({
  capitalAmount: z.number().min(1000, 'Minimum capital is 1,000 TND'),
  numberOfShares: z.number().min(1, 'Must have at least 1 share'),
  shareholders: z.array(shareholderSchema).min(1, 'At least one shareholder is required'),
});

export const wizardSchema = z.object({
  companyType: z.enum(['SARL', 'SUARL', 'SA', 'SCA']),
  info: companyInfoSchema,
  capital: capitalSchema,
});

export type CompanyInfoData = z.infer<typeof companyInfoSchema>;
export type CapitalData = z.infer<typeof capitalSchema>;
export type WizardData = z.infer<typeof wizardSchema>;

export type Step = 'type' | 'info' | 'capital' | 'review';

export const ENTITY_INFO: Record<string, {
  label: string;
  description: string;
  minCapital: string;
  minShareholders: string;
  liability: string;
  idealFor: string;
  taxNote: string;
  icon: string;
}> = {
  SARL: {
    label: 'SARL',
    description: 'Société à Responsabilité Limitée',
    minCapital: '1,000 TND',
    minShareholders: '2 (max 50)',
    liability: 'Limited to capital contributions',
    idealFor: 'Small to medium businesses, retail, services',
    taxNote: 'Subject to CIT at standard rate. Can opt for "Forfait" regime under revenue thresholds.',
    icon: 'Building2',
  },
  SUARL: {
    label: 'SUARL',
    description: 'Société Unipersonnelle à Responsabilité Limitée',
    minCapital: '1,000 TND',
    minShareholders: '1 (single member)',
    liability: 'Limited to capital contributions',
    idealFor: 'Solo entrepreneurs, freelancers, consultants',
    taxNote: 'Same tax regime as SARL. Ideal for sole founders wanting liability protection.',
    icon: 'User',
  },
  SA: {
    label: 'SA',
    description: 'Société Anonyme',
    minCapital: '50,000 TND (public) / 5,000 TND (private)',
    minShareholders: '7 (minimum)',
    liability: 'Limited to capital contributions',
    idealFor: 'Large businesses, companies planning to raise capital, joint ventures',
    taxNote: 'Subject to CIT. Required for companies listed on the Bourse de Tunis. Stricter governance requirements.',
    icon: 'Building',
  },
  SCA: {
    label: 'SCA',
    description: 'Société en Commandite par Actions',
    minCapital: '50,000 TND',
    minShareholders: '2 minimum (1 commandité + 1 commanditaire)',
    liability: 'Commandités: unlimited. Commanditaires: limited to contributions.',
    idealFor: 'Family businesses with outside investors, investment funds',
    taxNote: 'Complex structure with two tiers of shareholders. Commandités taxed personally.',
    icon: 'Users',
  },
};

export const STEPS: { key: Step; label: string }[] = [
  { key: 'type', label: 'Company Type' },
  { key: 'info', label: 'Details & Tax' },
  { key: 'capital', label: 'Capital' },
  { key: 'review', label: 'Review' },
];
