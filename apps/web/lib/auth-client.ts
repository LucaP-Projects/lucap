import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { ac, owner, admin, member } from "./permissions";

/**
 * Client instance for Better Auth. Adjust `baseURL` if your API route is mounted
 * at a different path.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL + '/api/auth',
  plugins: [
    organizationClient({
      ac,
      roles: {
        owner,
        admin,
        member,
      },
      dynamicAccessControl: {
        enabled: true,
      },
    }),
  ],
}) as any;

export default authClient;
