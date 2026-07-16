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
            },
            {
              name: 'Super Accountant',
              description: 'Senior accountant who manages accountant staff',
              systemRole: SystemRole.SUPER_ACCOUNTANT,
              permissions: [
                Permission.VIEW_DASHBOARD,
                Permission.VIEW_REPORTS,
                Permission.MANAGE_STAFF,
                Permission.MANAGE_SETTINGS
              ]
            },
            {
              name: 'Accountant Staff',
              description: 'Accountant staff member under a super accountant',
              systemRole: SystemRole.ACCOUNTANT_STAFF,
              permissions: [
                Permission.VIEW_DASHBOARD,
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

    // Customers are external to the default company — they get their own
    // tenant so they don't inherit the admin/staff company's store & data.
    const customerCompany = await prisma.company.create({
      data: {
        name: 'Customer Company',
        email: 'customer-company@example.com',
        isActive: true,
        slug: 'customer-company',
        roles: {
          create: [
            {
              name: 'Customer',
              description: 'Regular customer role',
              systemRole: SystemRole.CUSTOMER,
              permissions: [Permission.VIEW_DASHBOARD]
            }
          ]
        }
      },
      include: {
        roles: true
      }
    });

    context.customerCompanyId = customerCompany.id;

    console.log('✓ Created customer company with system roles');

    return company;
  }
};

export default seedCompany;
