import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc, memberAc, ownerAc } from "better-auth/plugins/organization/access";

export const statement = {
  ...defaultStatements,
  document: ["create", "read", "update", "delete"],
  ticket: ["create", "read", "update", "delete"],
  transaction: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
  ...ownerAc.statements,
  document: ["create", "read", "update", "delete"],
  ticket: ["create", "read", "update", "delete"],
  transaction: ["create", "read", "update", "delete"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  document: ["create", "read", "update", "delete"],
  ticket: ["create", "read", "update", "delete"],
  transaction: ["create", "read", "update", "delete"],
});

export const member = ac.newRole({
  ...memberAc.statements,
  document: ["read"],
  ticket: ["create", "read"],
  transaction: ["read"],
});
