import { Permission } from '@/lib/generated/prisma/enums';

export type Company = {
  id: string;
  name: string;
  logo?: string | null;
  email?: string | null;
  role: {
    name: string;
    permissions: Permission[];
  };
  isAdmin: boolean;
  companyRole: string;
  permissions: Permission[];
};
