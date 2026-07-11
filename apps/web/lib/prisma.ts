import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

try {
  (prisma as any).$use((params: any, next: any) => {
    if (params.model === 'JournalEntryLine' && ['create', 'createMany'].includes(params.action)) {
      const lines = params.args.data;
      const allLines = Array.isArray(lines) ? lines : [lines];
      const d = allLines.reduce((s: number, l: any) => s + (l.debit || 0), 0);
      const c = allLines.reduce((s: number, l: any) => s + (l.credit || 0), 0);
      if (Math.abs(d - c) > 0.001) throw new Error(`Unbalanced journal entry: debits ≠ credits`);
    }
    return next(params);
  });
} catch (e) {
  console.warn('Prisma middleware registration failed:', e);
}

export { prisma };
