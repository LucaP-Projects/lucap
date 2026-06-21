'use server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth,  } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export async function getUserCompanies() {
  try {
    const session = await auth.api.getSession();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const companies = await prisma.userCompany.findMany({
      where: {
        userId: session.user.id,
        isActive: true, // Filter out soft-deleted user company relationships
        company: {
          isActive: true // Already present, good!
        }
      },
      select: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            email: true
          }
        },
        role: {
          select: {
            name: true,
            permissions: true
          }
        },
        isAdmin: true
      },
      orderBy: {
        company: {
          name: 'asc'
        }
      }
    });

    return companies.map((uc) => ({
      id: uc.company.id,
      name: uc.company.name,
      logo: uc.company.logo,
      email: uc.company.email,
      role: {
        name: uc.role.name,
        permissions: uc.role.permissions
      },
      isAdmin: uc.isAdmin,
      companyRole: uc.role.name,
      permissions: uc.role.permissions
    }));
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw new Error('Failed to fetch companies');
  }
}

export async function selectCompany(companyId: string) {
  try {
    const session = await auth.api.getSession();

    if (!session?.user?.id) {
      throw new Error('Not authenticated');
    }

    const result = await prisma.$transaction(async (tx) => {
      const userCompany = await tx.userCompany.findFirst({
        where: {
          userId: session.user.id,
          companyId,
          isActive: true, // Filter out soft-deleted user company relationships
          company: { isActive: true }
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
              logo: true,
              isActive: true
            }
          },
          role: {
            select: {
              id: true,
              name: true,
              permissions: true
            }
          }
        }
      });

      if (!userCompany) {
        throw new Error('Company access denied');
      }
      const availableCompanies = await tx.userCompany.findMany({
        where: {
          userId: session.user.id,
          isActive: true, // Filter out soft-deleted user company relationships
          company: { isActive: true }
        },
        include: {
          company: {
            select: {
              id: true,
              name: true
            }
          },
          role: {
            select: {
              name: true,
              permissions: true
            }
          }
        }
      });

      // Make sure we're updating to an active company
      await tx.user.update({
        where: {
          id: session.user.id,
          isActive: true // Ensure user is active
        },
        data: { activeCompanyId: companyId }
      });

      return {
        company: userCompany.company,
        role: userCompany.role,
        isAdmin: userCompany.isAdmin,
        availableCompanies: availableCompanies.map((uc) => ({
          companyId: uc.company.id,
          companyRole: uc.role.name,
          isAdmin: uc.isAdmin,
          permissions: uc.role.permissions
        }))
      };
    });
    const cookieStore = await cookies();
    cookieStore.set('company-id', result.company.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    });

    
    revalidatePath('/', 'layout');

    revalidatePath('/companies', 'page');
    revalidatePath('/finance', 'page');
    revalidatePath('/category', 'page');
    return {
      companyId: result.company.id,
      role: result.role.name,
      isAdmin: result.isAdmin
    };
  } catch (error) {
    console.error('Error in selectCompany:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to select company');
  }
}
