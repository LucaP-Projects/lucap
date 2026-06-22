// prisma/seeds/utils/seedUtils.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../lib/generated/prisma/client";
import type { SeedModule, SeedContext } from '../types';

export const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

export async function executeSeedModules(modules: SeedModule[]): Promise<void> {
  const executed = new Set<string>();
  const context: SeedContext = {};

  async function executeSeedModule(module: SeedModule) {
    if (executed.has(module.name)) return;

    if (module.dependencies) {
      for (const depName of module.dependencies) {
        const depModule = modules.find((m) => m.name === depName);
        if (!depModule) {
          throw new Error(
            `Dependency "${depName}" not found for module "${module.name}"`
          );
        }
        await executeSeedModule(depModule);
      }
    }

    console.log(`Seeding ${module.name}...`);
    const result = await module.seed(context);
    // Store the result in context if needed
    if (result) {
      context[module.name] = result;
    }
    executed.add(module.name);
    console.log(`✓ ${module.name} seeded`);
  }

  for (const m of modules) {
    await executeSeedModule(m);
  }
}
