'use server';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// This page exists specifically for users who don't have an active company yet,
// so — unlike most company-scoped actions — it must not require one via
// getSessionWithCompany() (which would redirect back to this same page).
async function getPlainSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getUserCompanies() {
  try {
    const session = await getPlainSession();
    if (!session?.user?.id) {
      redirect('/auth/login');
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
            permissions: true,
            systemRole: true,
          },
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
        permissions: uc.role.permissions,
        systemRole: uc.role.systemRole
      },
      isAdmin: uc.isAdmin,
      companyRole: uc.role.name,
      systemRole: uc.role.systemRole,
      permissions: uc.role.permissions
    }));
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw new Error('Failed to fetch companies', { cause: error });
  }
}

export async function selectCompany(companyId: string) {
  try {
    const session = await getPlainSession();

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

      // Firm accountants have no UserCompany row for their clients — fall back to
      // checking whether their firm has an AccountantAssignment to this company.
      let company = userCompany?.company;
      let roleName = userCompany?.role.name;
      let isAdmin = userCompany?.isAdmin ?? false;

      if (!userCompany) {
        const assignment = await tx.accountantAssignment.findFirst({
          where: {
            companyId,
            accountant: { users: { some: { userId: session.user.id } } }
          },
          include: {
            company: {
              select: { id: true, name: true, email: true, logo: true, isActive: true }
            }
          }
        });

        if (!assignment || !assignment.company.isActive) {
          throw new Error('Company access denied');
        }

        company = assignment.company;
        roleName = 'Accountant';
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
        company: company!,
        role: { name: roleName! },
        isAdmin,
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
