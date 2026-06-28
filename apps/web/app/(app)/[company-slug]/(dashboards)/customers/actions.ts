'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentCompany, getSessionWithCompany } from '@/lib/auth';
import { CustomerStatus } from '@/lib/generated/prisma/enums';
import * as Prisma from '@/lib/generated/prisma/internal/prismaNamespace';
import { prisma } from '@/lib/prisma';
import {
  CustomerFilterType,
  CustomerFormData,
  CustomerListDTO,
  CustomerListItemDTO,
  CustomerShortListItem,
  CustomerStatistics
} from '@/types/customer';

export async function getCustomers(params?: {
  search?: string;
  status?: CustomerStatus;
  offset?: number;
  limit?: number;
  sort?: { field: string; orderBy: 'asc' | 'desc' };
  filter?: CustomerFilterType;
}): Promise<CustomerListDTO> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) {
    return {
      customers: [],
      total: 0,
      statistics: defaultStatistics
    };
  }

  const baseWhereInput: Prisma.CustomerWhereInput = {
    status: params?.status ?? CustomerStatus.ACTIVE,
    ...(params?.search && {
      OR: [
        { displayName: { contains: `%${params.search}%` } },
        { primaryEmail: { contains: `%${params.search}%` } },
        { primaryPhone: { contains: `%${params.search}%` } },
        { mobile: { contains: `%${params.search}%` } },
        { companyName: { contains: `%${params.search}%` } },
        { billingAddress: { string_contains: `%${params.search}%` } }
      ]
    }),
    ...(params?.filter && await getFilterConditions(params.filter, session.user.activeCompanyId))
  };

  try {
    const [parents, statistics] = await Promise.all([
      prisma.customer.findMany({
        where: { ...baseWhereInput, companyId: session.user.activeCompanyId, parentId: null, isActive: true },
        orderBy: params?.sort
          ? { [params.sort.field]: params.sort.orderBy }
          : { displayName: 'asc' },
        select: { id: true }
      }),
      getCustomerStatistics()
    ]);

    const children = await prisma.customer.findMany({
      where: {
        ...baseWhereInput,
        isActive: true,
        parentId: { in: parents.map((p) => p.id) },
        companyId: session.user.activeCompanyId
      },
      select: { id: true, parentId: true }
    });

    const orderedIds = parents.flatMap((parent) => [
      parent.id,
      ...children.filter((c) => c.parentId === parent.id).map((c) => c.id)
    ]);

    const customers = await prisma.customer.findMany({
      where: { isActive: true, id: { in: orderedIds }, companyId: session.user.activeCompanyId },
      select: {
        id: true,
        displayName: true,
        primaryEmail: true,
        billingAddress: true,
        companyName: true,
        mobile: true,
        parentId: true,
        primaryPhone: true,
        balance: true,
        level: true,
        status: true,
        customerType: {
          select: { name: true }
        },
        subCustomers: {
          select: { id: true }
        },
        invoices: {
          select: {
            id: true,
            amount: true,
            status: true,
            dueDate: true,
            payments: {
              select: {
                amount: true,
                paymentDate: true
              }
            }
          }
        }
      },
      skip: params?.offset,
      take: params?.limit
    });

    const sortedCustomers: CustomerListItemDTO[] = orderedIds
      .map((id) => customers.find((c) => c.id === id))
      .filter((c): c is NonNullable<typeof c> => c != null)
      .map((customer) => {
        const pendingInvoices = customer.invoices.filter(
          (inv) =>
            inv.status === 'PENDING' ||
            inv.status === 'PARTIAL' ||
            inv.status === 'OVERDUE'
        );
        const recentlyPaidInvoices = customer.invoices.filter(
          (inv) =>
            inv.status === 'PAID' &&
            inv.payments.some(
              (p) =>
                p.paymentDate >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            )
        );

        return {
          id: customer.id,
          displayName: customer.displayName,
          primaryEmail: customer.primaryEmail,
          pendingInvoices,
          balance: customer.balance,
          attachments: [],
          openEstimates: [],
          estimateAmount: 0,
          unbilliedActivities: [],
          billingAddress: customer.billingAddress,
          companyName: customer.companyName,
          mobile: customer.mobile,
          parentId: customer.parentId,
          primaryPhone: customer.primaryPhone,
          unbilliedAmount: pendingInvoices.reduce(
            (sum, inv) => sum + inv.amount,
            0
          ),
          recentlyPaidAmount: recentlyPaidInvoices.reduce(
            (sum, inv) =>
              sum + inv.payments.reduce((pSum, p) => pSum + p.amount, 0),
            0
          ),
          customerType: customer.customerType?.name,
          level: customer.level,
          status: customer.status,
          subCustomersCount: customer.subCustomers.length
        };
      });

    const total = await prisma.customer.count({ where: { ...baseWhereInput, companyId: session.user.activeCompanyId } });

    return {
      customers: sortedCustomers,
      total,
      statistics
    };
  } catch (err) {
    return {
      customers: [],
      total: 0,
      statistics: defaultStatistics
    };
  }
}

export async function getCustomersShort(params: {
  search?: string;
  status?: CustomerStatus;
}): Promise<CustomerShortListItem[]> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) {
    return [];
  }
  const baseWhereInput: Prisma.CustomerWhereInput = {
    status: params.status ?? CustomerStatus.ACTIVE,
    ...(params.search && {
      OR: [
        {
          displayName: { contains: `%${params.search}%`, mode: 'insensitive' }
        },
        // condition to match any combination of the composite search characters
        {
          displayName: {
            contains: `%${params.search
              .split('')
              .map((e) => e + '%')
              .join('')}`,
            mode: 'insensitive'
          }
        }
      ]
    }),
    AND: {
      level: { lt: 5 }, // TODO: store this in an environment variable
      companyId: session.user.activeCompanyId
    }
  };

  try {
    const parents = await prisma.customer.findMany({
      where: { ...baseWhereInput, parentId: null, isActive: true, companyId: session.user.activeCompanyId },
      orderBy: { displayName: 'asc' },
      select: { id: true }
    });
    const children = await prisma.customer.findMany({
      where: {
        ...baseWhereInput,
        parentId: { in: parents.map((p) => p.id) },
        isActive: true,
        companyId: session.user.activeCompanyId
      },
      select: { id: true, parentId: true }
    });

    const orderedIds = parents.flatMap((parent) => [
      parent.id,
      ...children.filter((c) => c.parentId === parent.id).map((c) => c.id)
    ]);

    const customers = await prisma.customer.findMany({
      where: { id: { in: orderedIds }, isActive: true, companyId: session.user.activeCompanyId },
      select: {
        id: true,
        displayName: true,
        parentId: true,
        level: true,
        parentCustomer: {
          select: {
            displayName: true
          }
        }
      }
    });
    const sortedCustomers = orderedIds
      .map((id) => {
        const c = customers.find((c) => c.id === id);
        if (!c) return null;
        return {
          displayName: c.displayName,
          id: c.id,
          level: c.level,
          parentId: c.parentId,
          ...(c.parentCustomer && { parentName: c.parentCustomer.displayName })
        };
      })
      .filter((c): c is NonNullable<typeof c> => c != null);

    // const parentIds = customers.map(c => c.parentId).filter((id): id is string => id != null);
    // const parents = await prisma.customer.findMany({
    //   where: { id: { in: parentIds } },
    //   select: { id: true, displayName: true }
    // });

    return sortedCustomers;
  } catch (err) {
    return [];
  }
}
export const getFullCustomer = async (id: string) =>
  await prisma.customer.findUnique({
    where: { id }
  });

async function getCustomerStatistics(): Promise<CustomerStatistics> {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) {
    return defaultStatistics;
  }
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [unbilledIncome, overdue, openInvoices, recentlyPaid] =
    await Promise.all([
      prisma.customer.aggregate({
        _count: {
          id: true
        },
        _sum: {
          balance: true
        },
        where: {
          invoices: {
            some: {
              status: 'PENDING'
            }
          },
        companyId: session.user.activeCompanyId }
      }),

      prisma.customer.aggregate({
        _count: {
          id: true
        },
        _sum: {
          balance: true
        },
        where: {
          invoices: {
            some: {
              status: 'OVERDUE'
            }
          },
        companyId: session.user.activeCompanyId }
      }),

      prisma.invoice.aggregate({
        _count: {
          id: true
        },
        _sum: {
          amount: true
        },
        where: {
          status: { in: ['PENDING', 'PARTIAL'] },
          companyId: session.user.activeCompanyId
        }
      }),

      prisma.invoice.aggregate({
        _count: {
          id: true
        },
        _sum: {
          amount: true
        },
        where: {
          status: 'PAID',
          payments: {
            some: {
              paymentDate: {
                gte: thirtyDaysAgo
              }
            }
          },
          companyId: session.user.activeCompanyId 
        }
      })
    ]);

  return {
    estimates: { amount: 0, count: 0 },
    unbilledAmount: unbilledIncome._sum.balance ?? 0,
    overdueInvoices: {
      amount: overdue._sum.balance ?? 0,
      count: overdue._count.id
    },
    openInvoices: {
      amount: openInvoices._sum.amount ?? 0,
      count: openInvoices._count.id
    },
    recentlyPaid: {
      amount: recentlyPaid._sum.amount ?? 0,
      count: recentlyPaid._count.id
    }
  };
}

function getFilterConditions(
  filter: CustomerFilterType,
  companyId: string
): Prisma.CustomerWhereInput {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  switch (filter) {
    case CustomerFilterType.UNBILLED_INCOME:
      return {
        invoices: {
          some: {
            status: 'PENDING'
          }
        },
        companyId
      };
    case CustomerFilterType.OVERDUE_INVOICES:
      return {
        invoices: {
          some: {
            status: 'OVERDUE'
          }
        },
        companyId
      };
    case CustomerFilterType.OPEN_INVOICES:
      return {
        invoices: {
          some: {
            status: { in: ['PENDING', 'PARTIAL'] }
          }
        },
        companyId
      };
    case CustomerFilterType.RECENTLY_PAID:
      return {
        invoices: {
          some: {
            status: 'PAID',
            payments: {
              some: {
                paymentDate: {
                  gte: thirtyDaysAgo
                }
              }
            }
          }
        },
        companyId
      };
    default:
      return {};
  }
}

const defaultStatistics: CustomerStatistics = {
  estimates: { amount: 0, count: 0 },
  unbilledAmount: 0,
  overdueInvoices: { amount: 0, count: 0 },
  openInvoices: { amount: 0, count: 0 },
  recentlyPaid: { amount: 0, count: 0 }
};

export async function createCustomer(formData: CustomerFormData) {
  try {
    const companyId = await getCurrentCompany();
    if (!companyId) return;
    // if (formData.shouldCreateUser === "true") {
    const customerRoleId = await prisma.role.findFirst({
      select: { id: true },
      where: { name: 'CUSTOMER' }
    });
    if (!customerRoleId) {
      return { error: 'Customer role not found' };
    }
    // }

    // await prisma.customer.create({
    //   data: {
    //     ...formData,
    //     displayName: formData.displayName,
    //     Company: { connect: { id: companyId } },
    //   }
    // });

    revalidatePath('/customers');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to create customer' };
  }
}

export async function updateCustomer(id: string, formData: FormData) {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.activeCompanyId) {
      return { error: 'No active company' };
    }
    const data: Prisma.CustomerUpdateInput = {
      displayName: formData.get('displayName') as string,
      givenName: formData.get('givenName') as string,
      middleName: formData.get('middleName') as string,
      familyName: formData.get('familyName') as string,
      title: formData.get('title') as string,
      suffix: formData.get('suffix') as string,
      companyName: formData.get('companyName') as string,
      primaryPhone: formData.get('primaryPhone') as string,
      primaryEmail: formData.get('primaryEmail') as string,
      billingAddress: JSON.parse(formData.get('billingAddress') as string),
      shippingAddress: JSON.parse(formData.get('shippingAddress') as string),
      metadata: JSON.parse(formData.get('metadata') as string),
      alternatePhone: JSON.parse(formData.get('alternatePhone') as string),
      mobile: JSON.parse(formData.get('mobile') as string),
      fax: JSON.parse(formData.get('fax') as string),
      webAddress: JSON.parse(formData.get('webAddress') as string),
      taxIdentifier: JSON.parse(formData.get('taxIdentifier') as string),
      secondaryTaxId: JSON.parse(formData.get('secondaryTaxId') as string),
      resaleNumber: JSON.parse(formData.get('resaleNumber') as string),
      businessNumber: JSON.parse(formData.get('businessNumber') as string),
      notes: JSON.parse(formData.get('notes') as string),
      balance: JSON.parse(formData.get('balance') as string),
      creditLimit: JSON.parse(formData.get('creditLimit') as string),
      preferredPaymentMethod: JSON.parse(
        formData.get('preferredPaymentMethod') as string
      ),
      taxable: JSON.parse(formData.get('taxable') as string) === 'true',
      printOnCheckName: JSON.parse(formData.get('printOnCheckName') as string),
      level: JSON.parse(formData.get('level') as string),
      status: JSON.parse(formData.get('status') as string)
    };

    await prisma.customer.update({
      where: { id, companyId: session.user.activeCompanyId },
      data
    });

    revalidatePath('/customers');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update customer' };
  }
}
export async function sparseUpdateCustomer(
  id: string,
  formData: CustomerFormData
) {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.activeCompanyId) {
      return { error: 'No active company' };
    }
    const data: Partial<Prisma.CustomerUpdateInput> = {};
    type UpdateFields = keyof Prisma.CustomerUpdateInput;

    const fields: UpdateFields[] = [
      'displayName',
      'givenName',
      'middleName',
      'familyName',
      'title',
      'suffix',
      'companyName',
      'primaryPhone',
      'primaryEmail',
      'alternatePhone',
      'mobile',
      'fax',
      'webAddress',
      'notes',
      'balance',
      'creditLimit',
      'preferredPaymentMethod',
      'taxable',
      'printOnCheckName',
      'taxIdentifier',
      'secondaryTaxId',
      'resaleNumber',
      'businessNumber',
      'status',
      'level'
    ];

    fields.forEach((field) => {
      const value = (<Prisma.CustomerUpdateInput>formData)[field];
      if (value !== null) {
        data[field] = value as any;
      }
    });

    (
      ['billingAddress', 'shippingAddress', 'metadata'] as UpdateFields[]
    ).forEach((jsonField) => {
      const value = (<Prisma.CustomerUpdateInput>formData)[jsonField] as string;
      if (value) {
        data[jsonField] = JSON.parse(value) as any;
      }
    });

    if (formData?.parentId) {
      // need to do manual checks here for invoices and background running jobs
      // for invoice generations for the parent customer
      data.parentCustomer = { connect: { id: formData.parentId as string } };
    }

    await prisma.customer.update({
      where: { id, companyId: session.user.activeCompanyId },
      data
    });

    revalidatePath('/customers');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update customer' };
  }
}
export async function getCustomer(id: string) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) {
    return null;
  }
  return await prisma.customer.findUnique({
    where: { id, companyId: session.user.activeCompanyId },
    include: {
      subCustomers: {
        orderBy: { displayName: 'asc' }
      },
      customerPaymentEvents: {
        include: {
          version: true
        },
        orderBy: { startDate: 'desc' }
      },
      invoices: {
        orderBy: { dueDate: 'desc' },
        take: 5
      },
      payments: {
        include: { invoice: true },
        orderBy: { paymentDate: 'desc' }
      }
    }
  });
}

export async function deleteCustomer(id: string) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) {
    return { error: 'No active company' };
  }

  const hasTransactions = await prisma.$transaction([
    prisma.invoice.count({ where: { customerId: id, companyId: session.user.activeCompanyId } }),
    prisma.payment.count({ where: { customerId: id, companyId: session.user.activeCompanyId } })
  ]);

  if (hasTransactions[0] || hasTransactions[1]) {
    return { error: 'Customer has invoices or payments' };
  }

  await prisma.customer.update({
    where: { id, companyId: session.user.activeCompanyId },
    data: { status: 'INACTIVE' }
  });

  revalidatePath('/customers');
  return { success: true };
}
