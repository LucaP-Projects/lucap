import { Permission } from '@/lib/generated/prisma/enums';

export type Company = {
  id: string;
  name: string;
  logo?: string | null;
  email?: string | null;
  role: {
    name: string;
    permissions: Permission[];
    systemRole: string | null;
  };
  isAdmin: boolean;
  companyRole: string;
  systemRole: string | null;
  permissions: Permission[];
};
