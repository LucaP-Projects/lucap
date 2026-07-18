// prisma/seeds/types/userTypes.ts
import { hash } from 'bcrypt';
import { SystemRole } from '@/lib/generated/prisma/enums';
import { SeedModule } from '../types';

import { prisma } from '../utils';

export interface CreateCustomerDTO {
  givenName: string;
  familyName: string;
  displayName: string;
  level: number;
  primaryEmail?: string;
  primaryPhone?: string;
  alternatePhone?: string;
  billingAddress?: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subCustomers?: Omit<
    CreateCustomerDTO,
    | 'subCustomers'
    | 'primaryEmail'
    | 'primaryPhone'
    | 'alternatePhone'
    | 'billingAddress'
  >[];
}

// prisma/seeds/data/users.ts

const staffCustomers = [
  { name: 'John Smith', role: 'Registrar' },
  { name: 'Maria Garcia', role: 'Financial Administrator' },
  { name: 'David Chen', role: 'Admissions Officer' }
];

const customersData: { parent: CreateCustomerDTO }[] = [
  {
    parent: {
      givenName: 'Alice',
      familyName: 'Johnson',
      displayName: 'Alice Johnson',
      level: 0,
      primaryEmail: 'alice.johnson@example.com',
      primaryPhone: '+1234567890',
      alternatePhone: '+1234567890',
      billingAddress: {
        line1: '123 Elm Street',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62704',
        country: 'USA'
      },
      subCustomers: [
        {
          givenName: 'Tom',
          familyName: 'Johnson',
          displayName: 'Tom Johnson',
          level: 1
        },
        {
          givenName: 'Lily',
          familyName: 'Johnson',
          displayName: 'Lily Johnson',
          level: 1
        }
      ]
    }
  },
  {
    parent: {
      givenName: 'Bob',
      familyName: 'Smith',
      displayName: 'Bob Smith',
      level: 0,
      primaryEmail: 'bob.smith@example.com',
      primaryPhone: '+1234567891',
      alternatePhone: '+1234567891',
      billingAddress: {
        line1: '456 Maple Ave',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62704',
        country: 'USA'
      },
      subCustomers: [
        {
          givenName: 'Anna',
          familyName: 'Smith',
          displayName: 'Anna Smith',
          level: 1
        }
      ]
    }
  },
  {
    parent: {
      givenName: 'Charlie',
      familyName: 'Brown',
      displayName: 'Charlie Brown',
      level: 0,
      primaryEmail: 'brown.family@example.com',
      primaryPhone: '+1234567892',
      alternatePhone: '+1234567892',
      billingAddress: {
        line1: '789 Pine Road',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62704',
        country: 'USA'
      },
      subCustomers: [
        {
          givenName: 'Ethan',
          familyName: 'Brown',
          displayName: 'Ethan Brown',
          level: 1
        },
        {
          givenName: 'Olivia',
          familyName: 'Brown',
          displayName: 'Olivia Brown',
          level: 1
        },
        {
          givenName: 'Noah',
          familyName: 'Brown',
          displayName: 'Noah Brown',
          level: 1
        }
      ]
    }
  }
];

const seedUsers: SeedModule = {
  name: 'users',
  dependencies: ['company'], // This module depends on roles being seeded first
  seed: async (context) => {
    if (!context.companyId) {
      throw new Error('Company ID not found in context');
    }
    console.log('Seeding users...');

    try {
      // Fetch required roles
      const adminRole = await prisma.role.findFirst({
        where: { systemRole: SystemRole.MODERATOR }
      });
      const staffRole = await prisma.role.findFirst({
        where: { systemRole: SystemRole.STAFF }
      });

      if (!adminRole || !staffRole) {
        throw new Error('Required system roles not found');
      }

      // Create admin user
      const adminPassword = await hash('admin123', 12);
      await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'admin user',
          password: adminPassword
        }
      });

      // Create staff users
      const staff = await Promise.all(
        staffCustomers.map(async (staffCustomer) => {
          const staffPassword = await hash('staff123', 12);
          return prisma.user.create({
            data: {
              email: `${staffCustomer.role.toLowerCase().replace(' ', '.')}@school.edu`,
              name: staffCustomer.name,
              password: staffPassword
            }
          });
        })
      );

      // Create family customers with parent and children
      const customers = await Promise.all(
        customersData.map(async (family) => {
          // Create parent user
          const userPassword = await hash('password123', 12);
          const user = await prisma.user.create({
            data: {
              email: family.parent.primaryEmail ?? '',
              name: family.parent.displayName,
              password: userPassword
            }
          });

          // Create parent customer
          const customer = await prisma.customer.create({
            data: {
              userId: user.id,
              companyId: context.companyId!,
              givenName: family.parent.givenName,
              familyName: family.parent.familyName,
              displayName: family.parent.displayName,
              primaryEmail: family.parent.primaryEmail,
              primaryPhone: family.parent.primaryPhone,
              billingAddress: family.parent.billingAddress,
              status: 'ACTIVE',
              level: family.parent.level
            }
          });

          // Create children as sub-customers
          const subCustomers = await Promise.all(
            (family.parent.subCustomers || []).map((child) =>
              prisma.customer.create({
                data: {
                  companyId: context.companyId!,
                  parentId: customer.id,
                  givenName: child.givenName,
                  familyName: child.familyName,
                  displayName: child.displayName,
                  status: 'ACTIVE',
                  level: child.level
                }
              })
            )
          );

          return { user, customer, subCustomers };
        })
      );

      console.log('✓ Created admin user');
      console.log(`✓ Created ${staff.length} staff users`);
      console.log(
        `✓ Created ${customers.length} family customers with ${customers.reduce(
          (acc, curr) => acc + curr.subCustomers.length,
          0
        )} children`
      );
    } catch (error) {
      console.error('Error seeding users:', error);
      throw error;
    }
  }
};

export default seedUsers;
