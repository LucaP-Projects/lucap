import { LiteralString } from "better-auth";
import { createAccessControl, Statements } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/organization/access";
import { Permission } from "@/lib/generated/prisma/enums";

/**
 * Maps our DB Permission enum to better-auth dynamic capability checks.
 * This allows us to use the database to define what permissions a role has,
 * rather than hardcoding them in this file.
 */
export const statement: Statements = {
  ...defaultStatements,
  // Base Company Resources
  [Permission.MANAGE_CUSTOMERS]: ["create", "read", "update", "delete"],
  [Permission.MANAGE_SUBSCRIPTIONS]: ["create", "read", "update", "delete"],
  [Permission.MANAGE_PAYMENTS]: ["create", "read", "update", "delete"],
  [Permission.VIEW_REPORTS]: ["read"],
  [Permission.MANAGE_SETTINGS]: ["update"],
  [Permission.MANAGE_STAFF]: ["create", "read", "update", "delete"],
  [Permission.MANAGE_TEMPLATES]: ["create", "read", "update", "delete"],
  [Permission.VIEW_DASHBOARD]: ["read"],
  [Permission.MANAGE_FILES]: ["create", "read", "update", "delete"],
  
  // Accountant Specific Scopes
  accountant_profile: ["read", "update"],
  client_management: ["create", "read", "update"],
  audit_log: ["read"],
  
  // Platform Admin Scopes
  platform_config: ["create", "read", "update", "delete"],
  user_management: ["create", "read", "update", "delete"],
  billing_admin: ["read", "update"],
} as const;

export const ac = createAccessControl(statement);

/**
 * Predefined static roles for the 3 main user types
 */
export const roles = {
  // 1. The Platform Admin
  ADMIN: ac.newRole({
    platform_config: ["create", "read", "update", "delete"],
    user_management: ["create", "read", "update", "delete"],
    billing_admin: ["read", "update"],
    audit_log: ["read"],
  }),

  // 2. The Accountant (Firm Level)
  ACCOUNTANT: ac.newRole({
    accountant_profile: ["read", "update"],
    client_management: ["create", "read", "update"],
    [Permission.VIEW_REPORTS]: ["read"],
    audit_log: ["read"],
    [Permission.MANAGE_FILES]: ["create", "read", "update", "delete"],
  }),

  // 3. The Client / Company Owner (Business Person)
  COMPANY_OWNER: ac.newRole({
    [Permission.MANAGE_SETTINGS]: ["update"],
    [Permission.MANAGE_STAFF]: ["create", "read", "update", "delete"],
    [Permission.VIEW_DASHBOARD]: ["read"],
    [Permission.MANAGE_PAYMENTS]: ["create", "read", "update", "delete"],
    [Permission.MANAGE_CUSTOMERS]: ["create", "read", "update", "delete"],
  })
} as const;

/**
 * A helper to create a better-auth Role object from a Prisma Role model.
 * This is used for custom company roles.
 */
export function createDynamicRole(roleName: string, permissions: Permission[]) {
  const roleStatements: Record<string, readonly LiteralString[]> = {};
  
  permissions.forEach(p => {
    const s = statement[p];
    if (s) {
      roleStatements[p] = s;
    }
  });

  return ac.newRole(roleStatements);
}

