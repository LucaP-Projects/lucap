import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { organization } from "better-auth/plugins";
import { ac, owner, admin, member } from "./permissions";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    emailAndPassword: { 
      enabled: true, 
    }, 
    secret: process.env.BETTER_AUTH_SECRET!,
    url: process.env.BETTER_AUTH_URL!,
    plugins: [
      organization({
        ac,
        roles: {
          owner,
          admin,
          member,
        },
        dynamicAccessControl: {
          enabled: true,
        },
        defaultRole: "member",
        // Allow users to belong to multiple organizations
        allowMultiple: true,
      })
    ],
});