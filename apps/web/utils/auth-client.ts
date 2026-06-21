import {
  inferAdditionalFields,
  adminClient,
  customSessionClient,
  magicLinkClient
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { auth } from '@/utils/auth';
import { ac, roles } from '@/utils/permissions';

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient({ ac, roles }),
    customSessionClient<typeof auth>(),
    magicLinkClient()
  ]
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  admin,
  sendVerificationEmail,
  forgetPassword,
  resetPassword,
  updateUser,
  magicLink
} = authClient;
