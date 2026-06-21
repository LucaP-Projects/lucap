import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { admin, customSession, magicLink } from 'better-auth/plugins';

import { db } from '@/lib/db';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendMagicLinkEmail
} from '@/lib/email-service';
import { hashPassword, verifyPassword } from '@/utils/argon2';
import { ac, roles } from '@/utils/permissions';
import { normalizeName, VALID_DOMAINS } from '@/utils/utils';

const options: BetterAuthOptions = {
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000',
  database: prismaAdapter(db, {
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
        process.env.NEXTAUTH_URL ||
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
        process.env.NEXTAUTH_URL ||
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
        const domain = email.split('@')[1].toLowerCase();
        const validDomains = VALID_DOMAINS();

        // Only check domain validation if there are restrictions (non-empty array)
        if (validDomains.length > 0 && !validDomains.includes(domain)) {
          throw new APIError('BAD_REQUEST', {
            message: 'Invalid domain. Please use a valid email.'
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
    nextCookies(),
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
          process.env.NEXTAUTH_URL ||
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
    customSession(async ({ user, session }: { user: any; session: any }) => {
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        include: {
          companies: {
            where: { isActive: true },
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  logo: true
                }
              },
              role: {
                select: {
                  name: true,
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

      const userCompanies = dbUser.companies.map((uc) => ({
        companyId: uc.companyId,
        companyRole: uc.role.name,
        isAdmin: uc.isAdmin,
        permissions: uc.role.permissions,
        name: uc.company.name,
        logo: uc.company.logo
      }));

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
          role: user.role || 'USER', // Use the user's system role, not company role
          permissions: activeCompany?.permissions ?? [],
          companyId: dbUser.activeCompanyId,
          availableCompanies: userCompanies,
          companyRole: activeCompany?.companyRole ?? null,
          isAdmin: activeCompany?.isAdmin ?? false,
          activeCompanyId: dbUser.activeCompanyId
        }
      };
    })
  ]
};

export const auth: ReturnType<typeof betterAuth> = betterAuth(options);

export type ErrorCode = keyof typeof auth.$ERROR_CODES | 'UNKNOWN';
