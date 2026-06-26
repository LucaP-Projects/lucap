import { Permission, SystemRole } from '@/lib/generated/prisma/enums';
import type { SeedModule } from '../types';
import { prisma } from '../utils/seedUtils';

const seedCompany: SeedModule = {
  name: 'company',
  dependencies: [],
  seed: async (context) => {
    console.log('Creating company and system roles...');

    const company = await prisma.company.create({
      data: {
        name: 'Default Company',
        email: 'company@example.com',
        isActive: true,
        slug: 'default-company',
        // Create roles along with the company
        roles: {
          create: [
            {
              name: 'Administrator',
              description: 'System administrator with full access',
              systemRole: SystemRole.ADMIN,
              permissions: [
                Permission.MANAGE_CUSTOMERS,
                Permission.MANAGE_SUBSCRIPTIONS,
                Permission.MANAGE_PAYMENTS,
                Permission.VIEW_REPORTS,
                Permission.MANAGE_SETTINGS,
                Permission.MANAGE_STAFF,
                Permission.MANAGE_TEMPLATES,
                Permission.VIEW_DASHBOARD,
                Permission.MANAGE_FILES
              ]
            },
            {
              name: 'Customer',
              description: 'Regular customer role',
              systemRole: SystemRole.CUSTOMER,
              permissions: [Permission.VIEW_DASHBOARD]
            },
            {
              name: 'Staff',
              description: 'Staff member role',
              systemRole: SystemRole.STAFF,
              permissions: [
                Permission.VIEW_DASHBOARD,
                Permission.MANAGE_CUSTOMERS,
                Permission.VIEW_REPORTS
              ]
            }
          ]
        }
      },
      // Include roles in the return value
      include: {
        roles: true
      }
    });

    // Store company ID in context
    context.companyId = company.id;

    console.log('✓ Created default company with system roles');
    return company;
  }
};

export default seedCompany;
