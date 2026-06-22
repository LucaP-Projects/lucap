import "dotenv/config";
import { seedUsers, seedAccountsTN, seedCompany } from './seeds/data';
import { prisma, executeSeedModules } from './seeds/utils/seedUtils';

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
