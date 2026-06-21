'use server';

import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { createCompanySchema, CreateCompanyInput } from '../types';
import { Permission, Prisma, SystemRole } from '@/lib/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { handleCompanyLogo } from '@/components/shared/utils';

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

function normalizeAddress(address: CreateCompanyInput['address']) {
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
  
async function seedCompanyAccounts(
  companyId: string,
  tx: Prisma.TransactionClient
) {
  try {
    const query = `
      WITH RECURSIVE mapping AS (
        SELECT
          t.id AS template_id,
          t.parent_id AS template_parent_id,
          t.title,
          t.is_custom,
          t.number,
          t.composed_number,
          gen_random_uuid() AS new_id
        FROM "AccountTemplate" t
        ORDER BY t.composed_number
      )
      INSERT INTO "Account" (
        id,
        title,
        is_custom,
        number,
        composed_number,
        is_active,
        parent_id,
        "companyId",
        "templateId",
        created_at,
        updated_at
      )
      SELECT
        mapping.new_id::text,
        mapping.title,
        mapping.is_custom,
        mapping.number,
        mapping.composed_number,
        true,
        parent.new_id::text,
        $1 as "companyId",
        mapping.template_id,
        NOW() as created_at,
        NOW() as updated_at
      FROM mapping
      LEFT JOIN mapping parent ON mapping.template_parent_id = parent.template_id
      ORDER BY mapping.composed_number;
    `;

    await tx.$executeRawUnsafe(query, companyId);
    return true;
  } catch (error) {
    console.error('Error seeding company accounts:', error);
    throw error;
  }
}

export async function createCompany(
  data: CreateCompanyInput
): Promise<CreateCompanyResponse> {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id: session.user.id }, { email: session.user.email }]
      }
    });

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create company with logo if it's a URL string
      const companyData: any = {
        name: data.name,
        companyType: data.companyType || null,
        email: data.email || null,
        taxId: data.taxId || null,
        phone: data.phone || null,
        website: data.website || null,
        address: data.address || null,
        isActive: true,
        metadata: {}
      };

      // If logo is a string (URL), include it
      if (typeof data.logo === 'string') {
        companyData.logo = data.logo;
      }

      const company = await tx.company.create({
        data: companyData
      });

      const adminRole = await tx.role.create({
        data: {
          name: `Administrator_${company.id}`,
          description: 'Company Administrator',
          permissions: Object.values(Permission),
          systemRole: SystemRole.ADMIN,
          companyId: company.id
        }
      });

      // Create user-company relationship with explicit ID verification
      const userCompany = await tx.userCompany.create({
        data: {
          userId: user.id,
          companyId: company.id,
          roleId: adminRole.id,
          isAdmin: true,
          isActive: true
        }
      });

      // Update user's active company
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { activeCompanyId: company.id }
      });

      // Verify the relationship was created correctly
      const verifyRelation = await tx.userCompany.findUnique({
        where: {
          userId_companyId: {
            userId: user.id,
            companyId: company.id
          }
        }
      });

      if (!verifyRelation) {
        throw new Error('Failed to create user-company relationship');
      }

      // Seed company accounts from templates
      try {
        await seedCompanyAccounts(company.id, tx);
      } catch (seedError) {
        console.error('Failed to seed company accounts:', seedError);
        throw new Error('Failed to create company accounts structure');
      }

      return { company, adminRole };
    });

    // Set company cookie
    const cookieStore = await cookies();
    cookieStore.set('company-id', result.company.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    });

    // Handle logo upload separately only if it's a File object
    if (data.logo instanceof File) {
      try {
        const logoUrl = await handleCompanyLogo(data.logo);
        await prisma.company.update({
          where: { id: result.company.id },
          data: { logo: logoUrl }
        });
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return {
          success: true,
          data: result.company,
          error:
            'Item created but image upload failed. Please try uploading the image again.'
        };
      }
    }
    // Update session with complete company information
    await unstable_update({
      companyId: result.company.id,
      companyRole: result.adminRole.name,
      permissions: result.adminRole.permissions,
      isAdmin: true,
      availableCompanies: [
        {
          companyId: result.company.id,
          companyRole: result.adminRole.name,
          isAdmin: true,
          permissions: result.adminRole.permissions
        }
      ]
    });

    revalidatePath('/', 'layout');
    revalidatePath('/companies', 'page');

    return {
      success: true,
      data: result // Return the created data for verification
    };
  } catch (error) {
    console.error('Detailed error in createCompany:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': {
          const field = (error.meta?.target as string[])?.[0];
          return {
            success: false,
            error:
              field === 'taxId'
                ? 'A company with this tax ID already exists'
                : field === 'email'
                  ? 'A company with this email address already exists'
                  : 'A company with these details already exists'
          };
        }
        default:
          return { success: false, error: 'Failed to create company' };
      }
    }

    return { success: false, error: 'Failed to create company' };
  }
}