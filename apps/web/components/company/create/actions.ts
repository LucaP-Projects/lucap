'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { handleCompanyLogo } from '@/components/shared/utils';
import { getSessionWithCompany } from '@/lib/auth';
import { Permission,  SystemRole } from '@/lib/generated/prisma/enums';
import * as Prisma from '@/lib/generated/prisma/internal/prismaNamespace';
import { prisma } from '@/lib/prisma';
import {  CreateCompanyInput } from '../types';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
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
<<<<<<< HEAD
=======
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
>>>>>>> feat/concierge-service-platform
    console.error('Error seeding company accounts:', error);
    throw error;
  }
}

export async function createCompany(
  data: CreateCompanyInput
) {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
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

      const company = await tx.company.create({
        data: {
        name: data.name,
        companyType: data.companyType || null,
        slug: slugify(data.name),
        email: data.email || null,
        taxId: data.taxId || null,
        phone: data.phone || null,
        website: data.website || null,
        address: data.address || null,
        logo: typeof data.logo === 'string' ? data.logo : null,
        isActive: true,
<<<<<<< HEAD
        metadata: {}
=======
        metadata: data.metadata || {}
>>>>>>> feat/concierge-service-platform
      }
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
      await tx.userCompany.create({
        data: {
          userId: user.id,
          companyId: company.id,
          roleId: adminRole.id,
          isAdmin: true,
          isActive: true
        }
      });

      // Update user's active company
      await tx.user.update({
        where: { id: user.id },
        data: { activeCompanyId: company.id }
      });

   

      // Seed company accounts from templates
      try {
        await seedCompanyAccounts(company.id, tx);
      } catch (seedError) {
<<<<<<< HEAD
=======
        if ((seedError as any)?.digest?.startsWith('NEXT_REDIRECT')) throw seedError;
>>>>>>> feat/concierge-service-platform
        console.error('Failed to seed company accounts:', seedError);
        throw new Error('Failed to create company accounts structure', { cause: seedError });
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
<<<<<<< HEAD
=======
        if ((uploadError as any)?.digest?.startsWith('NEXT_REDIRECT')) throw uploadError;
>>>>>>> feat/concierge-service-platform
        console.error('Image upload failed:', uploadError);
        return {
          success: true,
          data: {
            id: result.company.id,
            name: result.company.name,
            slug: slugify(result.company.name)
          },
          error:
            'Item created but image upload failed. Please try uploading the image again.'
        };
      }
    }

    revalidatePath('/', 'layout');
    revalidatePath('/companies', 'page');

    return {
      success: true,
      data: {
        id: result.company.id,
        name: result.company.name,
        slug: slugify(result.company.name)
      }
    };
  } catch (error) {
<<<<<<< HEAD
=======
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
>>>>>>> feat/concierge-service-platform
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
export type CreateCompanyResponse = ReturnType<typeof createCompany>;