import { createAuthClient } from "better-auth/react";
import { adminClient, customSessionClient, inferAdditionalFields, magicLinkClient,  } from "better-auth/client/plugins";
import { ac, owner, admin, member } from "./permissions";
import { roles } from "@/utils/permissions";
import { auth } from "./auth";

/**
 * Client instance for Better Auth. Adjust `baseURL` if your API route is mounted
 * at a different path.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL + '/api/auth',
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient({ ac, roles }),
    customSessionClient<typeof auth>(),
    magicLinkClient()
  ],
});

export type AuthClient = typeof authClient;

export default authClient;
