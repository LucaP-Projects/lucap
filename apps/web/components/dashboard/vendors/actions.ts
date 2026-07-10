'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { VendorStatus } from '@/lib/generated/prisma/enums';
import * as Prisma from '@/lib/generated/prisma/internal/prismaNamespace';
import { prisma } from '@/lib/prisma';

export type VendorFilters = {
  status?: VendorStatus | undefined;
  search?: string | undefined;
};

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export type VendorBasic = Prisma.VendorGetPayload<{
  include: {
    _count: {
      select: {
        bills: true;
        billPayments: true;
      };
    };
  };
}>;

export type VendorWithRelations = Prisma.VendorGetPayload<{
  include: {
    _count: {
      select: {
        bills: true;
        billPayments: true;
      };
    };
  };
}>;

export type VendorStats = {
  totalVendors: number;
  activeVendors: number;
  totalBalance: number;
  totalBills: number;
};

export async function getVendorsPage(
  page: number = 1,
  pageSize: number = 10,
  filters: VendorFilters = {}
) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  const validPage = Math.max(1, page);
  const validPageSize = Math.min(Math.max(1, pageSize), 100);
  const skip = (validPage - 1) * validPageSize;

  const where: any = {
    companyId: session.user.activeCompanyId,
    isActive: true,
  };

  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { displayName: { contains: filters.search, mode: 'insensitive' } },
      { companyName: { contains: filters.search, mode: 'insensitive' } },
      { primaryEmail: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      include: {
        _count: { select: { bills: true, billPayments: true } },
      },
      skip,
      take: validPageSize,
      orderBy: { displayName: 'asc' },
    }),
    prisma.vendor.count({ where }),
  ]);

  const pageCount = Math.ceil(total / validPageSize);
  return { data, metadata: { total, page: validPage, pageSize: validPageSize, pageCount } };
}

export async function getVendorDetails(id: string) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');

  const vendor = await prisma.vendor.findFirst({
    where: { id, companyId: session.user.activeCompanyId, isActive: true },
    include: {
      _count: { select: { bills: true, billPayments: true } },
      bills: {
        include: { lineItems: true, allocations: true },
        orderBy: { billDate: 'desc' },
        take: 20,
      },
      billPayments: {
        orderBy: { paymentDate: 'desc' },
        take: 20,
      },
    },
  });
  return vendor;
}

export async function createVendor(data: {
  displayName: string;
  companyName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  website?: string;
  billingAddress?: any;
  taxId?: string;
  notes?: string;
  accountNumber?: string;
}) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');

  const vendor = await prisma.vendor.create({
    data: {
      ...data,
      billingAddress: data.billingAddress || undefined,
      companyId: session.user.activeCompanyId,
    },
  });
  revalidatePath(`/${session.activeCompany?.slug}/vendors`);
  return { success: true, data: vendor };
}

export async function updateVendor(id: string, data: {
  displayName?: string;
  companyName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  website?: string;
  billingAddress?: any;
  taxId?: string;
  notes?: string;
  accountNumber?: string;
  status?: VendorStatus;
}) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');

  const vendor = await prisma.vendor.update({
    where: { id, companyId: session.user.activeCompanyId },
    data,
  });
  revalidatePath(`/${session.activeCompany?.slug}/vendors`);
  return { success: true, data: vendor };
}

export async function deleteVendors(ids: string[]) {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');

  try {
    await prisma.vendor.updateMany({
      where: { id: { in: ids }, companyId: session.user.activeCompanyId },
      data: { isActive: false, deactivatedAt: new Date(), deactivatedByUserId: session.user.id },
    });
    revalidatePath(`/${session.activeCompany?.slug}/vendors`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete vendors' };
  }
}

export async function getVendorStats(): Promise<VendorStats> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) return { totalVendors: 0, activeVendors: 0, totalBalance: 0, totalBills: 0 };
  if (!session?.user?.activeCompanyId) return { totalVendors: 0, activeVendors: 0, totalBalance: 0, totalBills: 0 };

  const companyId = session.user.activeCompanyId;
  const [vendors, balanceAgg] = await Promise.all([
    prisma.vendor.findMany({
      where: { companyId, isActive: true },
      select: { status: true, balance: true, _count: { select: { bills: true } } },
    }),
    prisma.vendor.aggregate({
      where: { companyId, isActive: true },
      _sum: { balance: true },
    }),
  ]);

  const activeVendors = vendors.filter(v => v.status === 'ACTIVE').length;
  const totalBills = vendors.reduce((sum, v) => sum + v._count.bills, 0);

  return {
    totalVendors: vendors.length,
    activeVendors,
    totalBalance: balanceAgg._sum.balance || 0,
    totalBills,
  };
}
