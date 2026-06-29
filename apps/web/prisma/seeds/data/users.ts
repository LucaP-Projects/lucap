/*
 * Seed credentials (for development only — never commit real passwords):
 *
 *   admin@lucap.com              / Admin@1234      (role: ADMIN, company admin)
 *   staff@lucap.com              / Staff@1234      (role: Staff)
 *   user@lucap.com               / User@1234       (role: Customer)
 *   superaccountant@lucap.com    / SuperAcc@1234   (role: Super Accountant)
 *   accountantstaff@lucap.com    / AccStaff@1234   (role: Accountant Staff)
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

const USERS = [
  {
    email: 'admin@lucap.com',
    name: 'Admin User',
    password: 'Admin@1234',
    userRole: UserRole.ADMIN,
    systemRole: SystemRole.ADMIN,
    isAdmin: true
  },
  {
    email: 'staff@lucap.com',
    name: 'Staff User',
    password: 'Staff@1234',
    userRole: UserRole.USER,
    systemRole: SystemRole.STAFF,
    isAdmin: false
  },
  {
    email: 'user@lucap.com',
    name: 'Regular User',
    password: 'User@1234',
    userRole: UserRole.USER,
    systemRole: SystemRole.CUSTOMER,
    isAdmin: false
  },
  {
    email: 'superaccountant@lucap.com',
    name: 'Super Accountant',
    password: 'SuperAcc@1234',
    userRole: UserRole.USER,
    systemRole: SystemRole.SUPER_ACCOUNTANT,
    isAdmin: false
  },
  {
    email: 'accountantstaff@lucap.com',
    name: 'Accountant Staff',
    password: 'AccStaff@1234',
    userRole: UserRole.USER,
    systemRole: SystemRole.ACCOUNTANT_STAFF,
    isAdmin: false
  }
];

const seedUsersAuth: SeedModule = {
  name: 'usersAuth',
  dependencies: ['company'],
  seed: async (context) => {
    if (!context.companyId) {
      throw new Error('Company ID not found in context — run seedCompany first');
    }

    console.log('Creating auth users...');

    for (const u of USERS) {
      const role = await prisma.role.findFirst({
        where: { systemRole: u.systemRole, companyId: context.companyId }
      });
      if (!role) throw new Error(`Role not found for systemRole: ${u.systemRole}`);

      const hashedPassword = await hash(u.password, ARGON2_OPTIONS);

      // Upsert user — update password/verification on re-runs
      const user = await prisma.user.upsert({
        where: { email: u.email },
        update: {
          password: hashedPassword,
          emailVerified: true,
          role: u.userRole,
          activeCompanyId: context.companyId
        },
        create: {
          email: u.email,
          name: u.name,
          password: hashedPassword,
          emailVerified: true,
          role: u.userRole,
          activeCompanyId: context.companyId
        }
      });
      console.log(`  User: ${user.email} (id: ${user.id})`);

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
        console.log(`    UserAccount: updated (id: ${existingAccount.id})`);
      } else {
        const created = await prisma.userAccount.create({
          data: {
            userId: user.id,
            accountId: user.id,
            providerId: 'credential',
            password: hashedPassword
          }
        });
        console.log(`    UserAccount: created (id: ${created.id})`);
      }

      // Link user to company
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

    console.log('✓ Auth users ready');
  }
};

export default seedUsersAuth;
