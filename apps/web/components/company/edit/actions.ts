'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { handleCompanyLogo } from '@/components/shared/utils';
import { auth } from '@/lib/auth';
import { Prisma } from '@/lib/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { EditCompanyInput } from '../types';

export type EditCompanyResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export async function getCompany(companyId: string) {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    const userCompany = await prisma.userCompany.findFirst({
      where: {
        userId: session.user.id,
        companyId: companyId,
        isActive: true
      }
    });

    if (!userCompany) {
      return { success: false, error: 'Access denied' };
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        companyType: true,
        email: true,
        taxId: true,
        phone: true,
        website: true,
        address: true,
        logo: true,
        isActive: true
      }
    });

    if (!company) {
      return { success: false, error: 'Company not found' };
    }

    return { success: true, data: company };
  } catch (error) {
    console.error('Error fetching company:', error);
    return { success: false, error: 'Failed to fetch company' };
  }
}

export async function editCompany(
  data: EditCompanyInput
): Promise<EditCompanyResponse> {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify user has access to edit this company
    const userCompany = await prisma.userCompany.findFirst({
      where: {
        userId: session.user.id,
        companyId: data.id,
        isActive: true,
        isAdmin: true // Only admins can edit company info
      }
    });

    if (!userCompany) {
      return { success: false, error: 'Access denied' };
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update company information including logo if it's a URL string
      const updateData: Prisma.CompanyUpdateInput = {
        name: data.name,
        companyType: data.companyType || null,
        email: data.email || null,
        taxId: data.taxId || null,
        phone: data.phone || null,
        website: data.website || null,
        address: data.address || null,
        updatedAt: new Date()
      };

      // If logo is a string (URL), include it in the update
      if (typeof data.logo === 'string') {
        updateData.logo = data.logo;
      }

      const updatedCompany = await tx.company.update({
        where: { id: data.id },
        data: updateData
      });

      return updatedCompany;
    });

    // Handle logo upload separately only if it's a File object
    if (data.logo instanceof File) {
      try {
        const logoUrl = await handleCompanyLogo(data.logo);
        await prisma.company.update({
          where: { id: data.id },
          data: { logo: logoUrl }
        });
        result.logo = logoUrl;
      } catch (uploadError) {
        console.error('Logo upload failed:', uploadError);
        return {
          success: true,
          data: result,
          error:
            'Company updated but logo upload failed. Please try uploading the logo again.'
        };
      }
    }

    revalidatePath('/', 'layout');

    revalidatePath('/companies', 'page');

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Detailed error in editCompany:', {
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
                  : field === 'name'
                    ? 'A company with this name already exists'
                    : 'A company with these details already exists'
          };
        }
        case 'P2025':
          return { success: false, error: 'Company not found' };
        default:
          return { success: false, error: 'Failed to update company' };
      }
    }

    return { success: false, error: 'Failed to update company' };
  }
}
