// prisma/seeds/types/seedTypes.ts
export interface SeedContext {
  companyId?: string;
  [key: string]: any;
}

export interface SeedModule {
  name: string;
  dependencies: string[];
  seed: (context: SeedContext) => Promise<any>;
}
