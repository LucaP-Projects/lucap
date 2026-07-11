'use server';

import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function batchExecute(
  operations: { bId: string; operation: string; entity: string; id?: string; data?: Record<string, unknown> }[]
) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error('Unauthorized');
  if (operations.length > 30) throw new Error('Max 30 operations per batch');

  const results = [];
  for (const op of operations) {
    try {
      let result;
      switch (`${op.operation}:${op.entity}`) {
        case 'create:customer': result = await prisma.customer.create({ data: { ...op.data as any, companyId: session.user.activeCompanyId } }); break;
        case 'create:invoice': result = await prisma.invoice.create({ data: { ...op.data as any, companyId: session.user.activeCompanyId } }); break;
        case 'create:vendor': result = await prisma.vendor.create({ data: { ...op.data as any, companyId: session.user.activeCompanyId } }); break;
        case 'create:item': result = await prisma.item.create({ data: { ...op.data as any, companyId: session.user.activeCompanyId } }); break;
        case 'create:bill': result = await prisma.bill.create({ data: { ...op.data as any, companyId: session.user.activeCompanyId } }); break;
        case 'update:customer': result = await prisma.customer.update({ where: { id: op.id }, data: op.data as any }); break;
        case 'update:invoice': result = await prisma.invoice.update({ where: { id: op.id }, data: op.data as any }); break;
        case 'update:vendor': result = await prisma.vendor.update({ where: { id: op.id }, data: op.data as any }); break;
        case 'update:item': result = await prisma.item.update({ where: { id: op.id }, data: op.data as any }); break;
        case 'read:customer': result = await prisma.customer.findUnique({ where: { id: op.id } }); break;
        case 'read:invoice': result = await prisma.invoice.findUnique({ where: { id: op.id } }); break;
        case 'read:vendor': result = await prisma.vendor.findUnique({ where: { id: op.id } }); break;
        case 'read:item': result = await prisma.item.findUnique({ where: { id: op.id } }); break;
        case 'delete:customer': result = await prisma.customer.update({ where: { id: op.id }, data: { isActive: false } }); break;
        case 'delete:invoice': result = await prisma.invoice.update({ where: { id: op.id }, data: { isActive: false } }); break;
        case 'delete:vendor': result = await prisma.vendor.update({ where: { id: op.id }, data: { isActive: false } }); break;
        default: throw new Error(`Unknown operation/entity: ${op.operation}:${op.entity}`);
      }
      results.push({ bId: op.bId, status: 'success', data: result });
    } catch (error: any) {
      results.push({ bId: op.bId, status: 'error', error: error?.message || 'Unknown error' });
    }
  }
  return results;
}

export async function getChangedEntities(since: Date, entityTypes: string[]) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error('Unauthorized');
  const companyId = session.user.activeCompanyId;
  if ((Date.now() - since.getTime()) / 86400000 > 30) throw new Error('Look-back cannot exceed 30 days');

  const results: Record<string, unknown[]> = {};
  for (const entity of entityTypes) {
    switch (entity) {
      case 'invoice': results[entity] = await prisma.invoice.findMany({ where: { companyId, updatedAt: { gte: since } }, take: 1000 }); break;
      case 'customer': results[entity] = await prisma.customer.findMany({ where: { companyId, updatedAt: { gte: since } }, take: 1000 }); break;
      case 'vendor': results[entity] = await prisma.vendor.findMany({ where: { companyId, updatedAt: { gte: since } }, take: 1000 }); break;
      case 'bill': results[entity] = await prisma.bill.findMany({ where: { companyId, updatedAt: { gte: since } }, take: 1000 }); break;
      case 'payment': results[entity] = await prisma.payment.findMany({ where: { companyId, createdAt: { gte: since } }, take: 1000 }); break;
      case 'estimate': results[entity] = await prisma.estimate.findMany({ where: { companyId, updatedAt: { gte: since } }, take: 1000 }); break;
      case 'account': results[entity] = await prisma.account.findMany({ where: { companyId, updatedAt: { gte: since } }, take: 1000 }); break;
      case 'item': results[entity] = await prisma.item.findMany({ where: { companyId, updatedAt: { gte: since } }, take: 1000 }); break;
      default: results[entity] = [];
    }
  }
  return results;
}

export async function getEntitlements() {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error('Unauthorized');
  const company = await prisma.company.findUnique({
    where: { id: session.user.activeCompanyId },
    select: { name: true, baseCurrency: true, createdAt: true },
  });
  if (!company) throw new Error('Company not found');
  const counts = await Promise.all([
    prisma.invoice.count({ where: { companyId: session.user.activeCompanyId, isActive: true } }),
    prisma.customer.count({ where: { companyId: session.user.activeCompanyId, isActive: true } }),
    prisma.vendor.count({ where: { companyId: session.user.activeCompanyId, isActive: true } }),
    prisma.item.count({ where: { companyId: session.user.activeCompanyId, isActive: true } }),
  ]);
  return {
    companyName: company.name,
    baseCurrency: company.baseCurrency,
    createdAt: company.createdAt,
    features: {
      invoicing: true, estimates: true, salesReceipts: true,
      bills: true, purchases: true, vendorCredits: true,
      inventory: counts[3] > 0, customers: counts[1] > 0,
      vendors: counts[2] > 0, reporting: true, multiCurrency: company.baseCurrency !== 'TND',
    },
    usage: { invoices: counts[0], customers: counts[1], vendors: counts[2], items: counts[3] },
  };
}
