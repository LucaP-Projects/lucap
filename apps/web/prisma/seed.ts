import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { seedUsers, seedAccountsTN, seedCompany } from './seeds/data';
import { executeSeedModules } from './seeds/utils/seedUtils';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  try {
    console.log('Starting seed process...');

    await executeSeedModules([seedAccountsTN, seedCompany, seedUsers]);

    console.log('✓ Seed process completed successfully');
  } catch (error) {
    console.error('× Seed process failed:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
