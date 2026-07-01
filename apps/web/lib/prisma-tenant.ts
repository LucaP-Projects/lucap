import { Prisma } from '@/lib/generated/prisma/client';
import { prisma } from './prisma';

/**
 * Sets context variables for Postgres RLS.
 */
function forContext(options: { companyId?: string; isAdmin?: boolean; userId?: string }) {
  return Prisma.defineExtension((client) =>
    client.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const { companyId, isAdmin, userId } = options;
            
            const setups: any[] = [];
            if (companyId) setups.push(client.$executeRaw`SELECT set_config('app.current_company_id', ${companyId}, TRUE)`);
            if (isAdmin) setups.push(client.$executeRaw`SELECT set_config('app.is_admin', 'true', TRUE)`);
            if (userId) setups.push(client.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, TRUE)`);

            if (setups.length === 0) return query(args);

            const results = await client.$transaction([
              ...setups,
              query(args),
            ]);
            return results[results.length - 1];
          },
        },
      },
    })
  );
}

export function tenantPrismaFor(companyId: string, userId?: string) {
  return prisma.$extends(forContext({ companyId, userId }));
}

export function adminPrisma() {
  return prisma.$extends(forContext({ isAdmin: true }));
}

export default tenantPrismaFor;
