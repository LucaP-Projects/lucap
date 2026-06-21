import type { Permission } from '@prisma/client';

type UserCompany = {
  companyId: string;
  companyRole: string;
  isAdmin: boolean;
  permissions: Permission[];
  name: string;
  logo?: string | null;
};

// Maintain NextAuth compatibility for existing code
declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    emailVerified?: boolean;
    image?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    role: string;
    permissions: Permission[];
    companyId: string | null;
    availableCompanies: UserCompany[];
    companyRole: string | null;
    isAdmin: boolean;
    activeCompanyId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      emailVerified?: boolean;
      image?: string | null;
      createdAt?: Date;
      updatedAt?: Date;
      role: string;
      permissions: Permission[];
      companyId: string | null;
      availableCompanies: UserCompany[];
      companyRole: string | null;
      isAdmin: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: Permission[];
    companyId: string | null;
    availableCompanies: UserCompany[];
    companyRole: string | null;
    isAdmin: boolean;
  }
}
