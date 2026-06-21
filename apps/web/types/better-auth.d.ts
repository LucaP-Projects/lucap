import type { Permission } from '@prisma/client';

type UserCompany = {
  companyId: string;
  companyRole: string;
  isAdmin: boolean;
  permissions: Permission[];
  name: string;
  logo?: string | null;
};

// Extend Better Auth types to include custom session fields
declare module 'better-auth/types' {
  interface User {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
    // Custom fields from additionalFields and customSession
    role: string;
    permissions: Permission[];
    companyId: string | null;
    availableCompanies: UserCompany[];
    companyRole: string | null;
    isAdmin: boolean;
    activeCompanyId?: string | null;
  }

  interface Session {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  }
}
