'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { createCompanySchema, CreateOrganizationInput } from '../types';

export type CreateCompanyResponse = {
  success: boolean;
  data?: {
    id: string;
    name: string;
    slug: string;
  };
  error?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function nullIfBlank(value: string | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeAddress(address: CreateOrganizationInput['address']) {
  if (!address) return null;

  const normalized = {
    street: nullIfBlank(address.street),
    city: nullIfBlank(address.city),
    state: nullIfBlank(address.state),
    postalCode: nullIfBlank(address.postalCode),
    country: nullIfBlank(address.country),
  };

  const hasAnyValue = Object.values(normalized).some((value) => value !== null);
  return hasAnyValue ? normalized : null;
}

export async function createCompany(
  data: unknown
): Promise<CreateCompanyResponse> {
  try {
    const parsed = createCompanySchema.safeParse(data);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message ?? 'Invalid company data';
      return { success: false, error: firstIssue };
    }

    const input = parsed.data;
    const requestHeaders = await headers();

    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session?.user?.id) {
      redirect('/auth/login');
    }

    const trimmedName = input.name.trim();
    if (!trimmedName) {
      return { success: false, error: 'Company name is required' };
    }

    let logoUrl: string | undefined;
    if (typeof input.logo === 'string' && input.logo.trim()) {
      logoUrl = input.logo.trim();
    }

    const metadata = {
      OrganizationType: nullIfBlank(input.OrganizationType),
      email: nullIfBlank(input.email),
      taxId: nullIfBlank(input.taxId),
      phone: nullIfBlank(input.phone),
      website: nullIfBlank(input.website),
      address: normalizeAddress(input.address),
    };

    const organization = await auth.api.createOrganization({
      body: {
        name: trimmedName,
        slug: slugify(trimmedName),
        logo: logoUrl,
        metadata,
        isOnboarded: true,
        isVerified: false,
        isLucaClient: false,
        memberQuota: 0,
        subscriptions: ['free'],
      },
      headers: requestHeaders,
    });

    await auth.api.setActiveOrganization({
      body: {
        organizationId: organization.id,
      },
      headers: requestHeaders,
    });

    revalidatePath('/', 'layout');
    revalidatePath('/onboarding', 'layout');
    revalidatePath('/dashboard', 'layout');

    return {
      success: true,
      data: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
    };
  } catch (error) {
    console.error('Detailed error in createCompany:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    const message = error instanceof Error ? error.message : 'Failed to create company';
    return { success: false, error: message };
  }
}
