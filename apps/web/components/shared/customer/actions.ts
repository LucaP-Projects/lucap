'use server';


import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type CustomerSelectData = {
  id: string;
  displayName: string;
  primaryEmail: string | null;
  level: number;
  subCustomers: CustomerSelectData[];
  billingAddress?: PrismaJson.Address | null;
};
type GetCustomerResponse = {
  success: boolean;
  data?: CustomerSelectData;
  error?: string;
  redirect?: string;
};

export async function getCustomerById(
  id: string
): Promise<GetCustomerResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id,
        companyId: session.user.activeCompanyId,
        isActive: true
      },
      select: {
        id: true,
        displayName: true,
        primaryEmail: true,
        level: true,
        billingAddress: true,
        parentCustomer: {
          select: {
            id: true,
            displayName: true,
            primaryEmail: true,
            level: true
          }
        }
      }
    });

    if (!customer) {
      return {
        success: false,
        error: 'Customer not found'
      };
    }

    const customerData: CustomerSelectData = {
      ...customer,
      displayName: customer.parentCustomer
        ? `${customer.parentCustomer.displayName} > ${customer.displayName}`
        : customer.displayName,
      subCustomers: []
    };

    return {
      success: true,
      data: customerData
    };
  } catch (error) {
    console.error('Error fetching customer:', error);
    return {
      success: false,
      error: 'Failed to fetch customer'
    };
  }
}

async function fetchCustomersRecursively(
  parentId: string | null,
  companyId: string,
  level: number = 0,
  search?: string
): Promise<CustomerSelectData[]> {
  if (level >= 5) return [];

  // Get all customers at this level without filtering by search
  const customers = await prisma.customer.findMany({
    where: {
      companyId,
      parentId,
      isActive: true
    },
    select: {
      id: true,
      displayName: true,
      primaryEmail: true,
      level: true,
      billingAddress: true
    }
  });

  const results = [];
  for (const customer of customers) {
    // Recursively get all subcustomers
    const subCustomers = await fetchCustomersRecursively(
      customer.id,
      companyId,
      level + 1,
      search
    );

    // Include this customer if:
    // 1. No search term is provided, OR
    // 2. This customer's name matches the search, OR
    // 3. Any of its subcustomers match the search
    if (
      !search ||
      customer.displayName.toLowerCase().includes(search.toLowerCase()) ||
      subCustomers.length > 0
    ) {
      results.push({
        ...customer,
        subCustomers: subCustomers || []
      });
    }
  }

  return results;
}

type GetCustomersResponse = {
  success: boolean;
  data?: CustomerSelectData[];
  error?: string;
  redirect?: string;
};

export async function getCustomersForSelect(
  search?: string
): Promise<GetCustomersResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }
    const customers = await fetchCustomersRecursively(
      null,
      session.user.activeCompanyId,
      0,
      search
    );

    return {
      success: true,
      data: customers
    };
  } catch (error) {
    console.error('Error fetching customers:', error);
    return {
      success: false,
      error: 'Failed to fetch customers'
    };
  }
}

/**
 * Get the total number of customers for a specific company
 * @param companyId The ID of the company
 * @returns The count of customers
 */
export async function getCustomerCount(companyId: string): Promise<number> {
  if (!companyId) {
    throw new Error('Company ID is required');
  }

  try {
    const count = await prisma.customer.count({
      where: {
        companyId: companyId,
        status: 'ACTIVE', // Only count active customers
        isActive: true // Also respect soft delete
      }
    });

    return count;
  } catch (error) {
    console.error('Failed to fetch customer count:', error);
    throw new Error('Failed to fetch customer count');
  }
}

// Add a function to soft-delete customers
export async function deleteCustomer(customerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    // Check if customer exists and belongs to company
    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
        companyId: session.user.activeCompanyId,
        isActive: true
      },
      include: {
        subCustomers: {
          where: { isActive: true }
        },
        invoices: {
          where: { isActive: true },
          select: { id: true }
        },
        payments: {
          where: { isActive: true },
          select: { id: true }
        },
        estimates: {
          where: { isActive: true },
          select: { id: true }
        },
        salesReceipts: {
          where: { isActive: true },
          select: { id: true }
        },
        refundReceipts: {
          where: { isActive: true },
          select: { id: true }
        },
        delayedCharges: {
          where: { isActive: true },
          select: { id: true }
        },
        delayedCredits: {
          where: { isActive: true },
          select: { id: true }
        },
        creditMemos: {
          where: { isActive: true },
          select: { id: true }
        }
      }
    });

    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }

    // Don't allow deletion if there are sub-customers
    if (customer.subCustomers.length > 0) {
      return {
        success: false,
        error: 'Cannot delete customer with sub-customers. Please delete sub-customers first.'
      };
    }

    // Don't allow deletion if there are related transactions/documents
    const hasRelatedDocs =
      customer.invoices.length > 0 ||
      customer.payments.length > 0 ||
      customer.estimates.length > 0 ||
      customer.salesReceipts.length > 0 ||
      customer.refundReceipts.length > 0 ||
      customer.delayedCharges.length > 0 ||
      customer.delayedCredits.length > 0 ||
      customer.creditMemos.length > 0;

    if (hasRelatedDocs) {
      return {
        success: false,
        error: 'Cannot delete customer with associated documents. Consider inactivating instead.'
      };
    }

    // Perform soft delete
    await prisma.customer.update({
      where: {
        id: customerId,
        companyId: session.user.activeCompanyId
      },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedByUserId: session.user.id,
        deactivationReason: 'Customer deactivated by user',
        status: 'INACTIVE' // Also update the status to maintain consistency
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting customer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete customer'
    };
  }
}
