/*
 * Seed credentials (for development only — never commit real passwords):
 *
 *   admin@lucap.com              / Admin@1234      (Admin — platform layout, no company)
 *   user@lucap.com               / User@1234       (Moderator — owns Default Company + its store)
 *   staff@lucap.com              / Staff@1234      (Staff — works under the Moderator's company)
 *   accountant@lucap.com         / Accountant@1234 (Accountant — owns Demo Accounting Firm, single flat profile type)
 */

import { hash } from '@node-rs/argon2';
import { UserRole, SystemRole } from '@/lib/generated/prisma/enums';
import type { SeedModule } from '../types';
import { prisma } from '../utils/seedUtils';

const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1
};

const COMPANY_USERS = [
  {
    email: 'user@lucap.com',
    name: 'Moderator User',
    password: 'User@1234',
    systemRole: SystemRole.MODERATOR,
    isAdmin: true
  },
  {
    email: 'staff@lucap.com',
    name: 'Staff User',
    password: 'Staff@1234',
    systemRole: SystemRole.STAFF,
    isAdmin: false
  }
];

const ACCOUNTANT_USER = {
  email: 'accountant@lucap.com',
  name: 'Accountant User',
  password: 'Accountant@1234'
};

async function upsertAuthUser(u: {
  email: string;
  name: string;
  password: string;
  userRole: UserRole;
  activeCompanyId?: string;
}) {
  const hashedPassword = await hash(u.password, ARGON2_OPTIONS);

  // Upsert user — update password/verification on re-runs
  const user = await prisma.user.upsert({
    where: { email: u.email },
    update: {
      password: hashedPassword,
      emailVerified: true,
      role: u.userRole,
      activeCompanyId: u.activeCompanyId ?? null
    },
    create: {
      email: u.email,
      name: u.name,
      password: hashedPassword,
      emailVerified: true,
      role: u.userRole,
      activeCompanyId: u.activeCompanyId ?? null
    }
  });

  // UserAccount with providerId='credential' is what better-auth checks for password login.
  // Avoid upsert-by-custom-id; use findFirst + create/update instead.
  const existingAccount = await prisma.userAccount.findFirst({
    where: { userId: user.id, providerId: 'credential' }
  });

  if (existingAccount) {
    await prisma.userAccount.update({
      where: { id: existingAccount.id },
      data: { password: hashedPassword, accountId: user.id }
    });
  } else {
    await prisma.userAccount.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: 'credential',
        password: hashedPassword
      }
    });
  }

  return user;
}

const seedUsersAuth: SeedModule = {
  name: 'usersAuth',
  dependencies: ['company'],
  seed: async (context) => {
    if (!context.companyId) {
      throw new Error('Company ID not found in context — run seedCompany first');
    }

    console.log('Creating auth users...');

    // Platform admin — no company, routed straight to the /admin layout.
    const admin = await upsertAuthUser({
      email: 'admin@lucap.com',
      name: 'Admin User',
      password: 'Admin@1234',
      userRole: UserRole.ADMIN
    });
    console.log(`  User: ${admin.email} (id: ${admin.id})`);

    // Company users — Moderator owns the company, Staff works under it.
    for (const u of COMPANY_USERS) {
      const role = await prisma.role.findFirst({
        where: { systemRole: u.systemRole, companyId: context.companyId }
      });
      if (!role) throw new Error(`Role not found for systemRole: ${u.systemRole}`);

      const user = await upsertAuthUser({
        email: u.email,
        name: u.name,
        password: u.password,
        userRole: UserRole.USER,
        activeCompanyId: context.companyId
      });
      console.log(`  User: ${user.email} (id: ${user.id})`);

      await prisma.userCompany.upsert({
        where: { userId_companyId: { userId: user.id, companyId: context.companyId } },
        update: { roleId: role.id, isAdmin: u.isAdmin },
        create: {
          userId: user.id,
          companyId: context.companyId,
          roleId: role.id,
          isAdmin: u.isAdmin,
          isActive: true
        }
      });
      console.log(`    UserCompany: linked to company`);
    }

    // Accountant firm — a separate tenant that services the default company as a client.
    // Single flat profile type: no role distinction beyond firm ownership.
    const accountant = await upsertAuthUser({
      email: ACCOUNTANT_USER.email,
      name: ACCOUNTANT_USER.name,
      password: ACCOUNTANT_USER.password,
      userRole: UserRole.USER
    });
    console.log(`  User: ${accountant.email} (id: ${accountant.id})`);

    const firm = await prisma.accountant.upsert({
      where: { slug: 'demo-accounting-firm' },
      update: { ownerId: accountant.id },
      create: {
        name: 'Demo Accounting Firm',
        slug: 'demo-accounting-firm',
        ownerId: accountant.id
      }
    });
    console.log(`  Accountant firm: ${firm.name} (id: ${firm.id})`);

    await prisma.accountantUser.upsert({
      where: { accountantId_userId: { accountantId: firm.id, userId: accountant.id } },
      update: {},
      create: { accountantId: firm.id, userId: accountant.id }
    });
    console.log(`    AccountantUser: ${accountant.email} linked to firm`);

    await prisma.accountantAssignment.upsert({
      where: { accountantId_companyId: { accountantId: firm.id, companyId: context.companyId } },
      update: {},
      create: { accountantId: firm.id, companyId: context.companyId }
    });
    console.log('    AccountantAssignment: firm linked to Default Company');

    console.log('✓ Auth users ready');
  }
};

export default seedUsersAuth;
