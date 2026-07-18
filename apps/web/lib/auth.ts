import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { admin, customSession, magicLink } from 'better-auth/plugins';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendMagicLinkEmail
} from '@/lib/email-service';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/utils/argon2';
import { ac, roles } from '@/utils/permissions';
import { normalizeName, verifyUserEmail } from '@/utils/utils';

const options: BetterAuthOptions = {
  baseURL:
    process.env.BETTER_AUTH_URL ||

    'http://localhost:3000',
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 60 * 60,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Ensure we have an absolute URL
      const baseUrl =
        process.env.BETTER_AUTH_URL ||
        'http://localhost:3000';
      const absoluteUrl = url.startsWith('http')
        ? url
        : new URL(url, baseUrl).toString();
      const link = new URL(absoluteUrl);
      link.searchParams.set('callbackURL', '/verify');

      await sendVerificationEmail({
        to: user.email,
        subject: 'Verify your email address',
        verificationUrl: String(link)
      });
    }
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    autoSignIn: false,
    password: {
      hash: hashPassword,
      verify: verifyPassword
    },
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      // Ensure we have an absolute URL
      const baseUrl =
        process.env.BETTER_AUTH_URL ||
        'http://localhost:3000';
      const absoluteUrl = url.startsWith('http')
        ? url
        : new URL(url, baseUrl).toString();

      await sendPasswordResetEmail({
        to: user.email,
        subject: 'Reset your password',
        resetUrl: String(absoluteUrl)
      });
    }
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-up/email') {
        const email = String(ctx.body.email);
        const { valid: isEmailValid, reason } = await verifyUserEmail(email);
        if (!isEmailValid) {
          throw new APIError('BAD_REQUEST', {
            message: 'Invalid email. Please use a valid email. Reason: ' + reason,
          });
        }
        const name = normalizeName(ctx.body.name);

        return {
          context: { ...ctx, body: { ...ctx.body, name } }
        };
      }

      if (ctx.path === '/sign-in/magic-link') {
        const name = normalizeName(ctx.body.name);

        return {
          context: { ...ctx, body: { ...ctx.body, name } }
        };
      }

      if (ctx.path === '/update-user') {
        const name = normalizeName(ctx.body.name);

        return {
          context: { ...ctx, body: { ...ctx.body, name } }
        };
      }
    })
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(';') ?? [];

          if (ADMIN_EMAILS.includes(user.email)) {
            return { data: { ...user, role: 'ADMIN' } };
          }

          return { data: user };
        }
      }
    }
  },
  user: {
    additionalFields: {
      role: {
        type: ['USER', 'ADMIN'],
        input: false
      },
      activeCompanyId: {
        type: 'string',
        input: false
      }
    }
  },
  account: {
    modelName: 'UserAccount'
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30 days
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60
    }
  },
  plugins: [
    admin({
      defaultRole: 'USER',
      adminRoles: ['ADMIN'],
      ac,
      roles
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // Ensure we have an absolute URL
        const baseUrl =
          process.env.BETTER_AUTH_URL ||
          'http://localhost:3000';
        const absoluteUrl = url.startsWith('http')
          ? url
          : new URL(url, baseUrl).toString();

        await sendMagicLinkEmail({
          to: email,
          subject: 'Magic Link Login',
          magicLinkUrl: String(absoluteUrl)
        });
      }
    }),

  ]
};
export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({ user, session }) => {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          accountantProfiles: {
            select: {
              id: true,
              accountant: {
                select: {
                  assignments: {
                    select: {
                      company: {
                        select: { id: true, name: true, logo: true, slug: true }
                      }
                    }
                  }
                }
              }
            }
          },
          companies: {
            where: { isActive: true },
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  logo: true,
                  slug: true
                }
              },
              role: {
                select: {
                  name: true,
                  systemRole: true,
                  permissions: true
                }
              }
            }
          }
        }
      });

      if (!dbUser) {
        throw new Error('User not found in database');
      }

      const memberCompanies = dbUser.companies.map((uc) => ({
        companyId: uc.companyId,
        companyRole: uc.role.name,
        systemRole: uc.role.systemRole,
        isAdmin: uc.isAdmin,
        permissions: uc.role.permissions,
        name: uc.company.name,
        logo: uc.company.logo,
        slug: uc.company.slug,
        accessType: 'member' as const
      }));

      // Companies reachable via accountant-firm assignment, not direct membership —
      // a firm accountant has no UserCompany row for their clients.
      const memberCompanyIds = new Set(memberCompanies.map((c) => c.companyId));
      const assignedCompanies = dbUser.accountantProfiles.flatMap((au) =>
        au.accountant.assignments
          .filter((a) => !memberCompanyIds.has(a.company.id))
          .map((a) => ({
            companyId: a.company.id,
            companyRole: 'Accountant',
            systemRole: null,
            isAdmin: false,
            permissions: [],
            name: a.company.name,
            logo: a.company.logo,
            slug: a.company.slug,
            accessType: 'accountant' as const
          }))
      );

      const userCompanies = [...memberCompanies, ...assignedCompanies];

      const isAccountant = dbUser.accountantProfiles.length > 0;

      const activeCompany = userCompanies.find(
        (uc) => uc.companyId === dbUser.activeCompanyId
      );

      return {
        session: {
          id: session.id,
          token: session.token,
          userId: user.id,
          expiresAt: session.expiresAt,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          ipAddress: session.ipAddress ?? null,
          userAgent: session.userAgent ?? null
        },
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image ?? null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          role: dbUser.role, 
          isAccountant,
          permissions: activeCompany?.permissions ?? [],
          companyRole: activeCompany?.companyRole ?? null,
          isAdmin: activeCompany?.isAdmin ?? false,
          availableCompanies: userCompanies,
          activeCompanyId: dbUser?.activeCompanyId ?? undefined,
          activeCompany: activeCompany || null,
        }
      };
    }, options),
    nextCookies(),
  ]
});

export async function getCurrentCompany() {
  const session = await getSessionWithCompany();

  if (!session?.user) {
    return null;
  }

  // Use activeCompanyId which is more consistent
  if (!session.user.activeCompanyId) {
    return false;
  }

  // Find the active company from available companies
  const activeCompany = session.user.availableCompanies?.find(
    (company) => company.companyId === session.user.activeCompanyId
  );

  return activeCompany || false;
}

export async function getSessionWithCompany() {
  const session = await auth.api.getSession({headers: await headers()});

  if (!session?.user) {
    return redirect('/auth/login');
  }

  // Use activeCompanyId which is more consistent
  if (!session.user.activeCompanyId) {
    return redirect('/select-company');
  }
  if (!session.user.availableCompanies.length) {
    return redirect('/select-company');
  
  }
  // Find the active company from available companies
  const activeCompany = session.user.availableCompanies.find(
    (company) => company.companyId === session.user.activeCompanyId
  );

  return {
    ...{...session, user: {...session.user, activeCompanyId: session.user.activeCompanyId, id: session.user.id}},
    activeCompany: activeCompany || null
  };
}

export type ErrorCode = keyof typeof auth.$ERROR_CODES | 'UNKNOWN';