# Better Auth installation (Next.js)

Follow these steps to install and configure Better Auth for the `apps/web` Next.js app.

1) Install the package

```bash
# from the apps/web folder (use your package manager)
bun add better-auth
# or with npm
npm install better-auth
# If you will use the Next.js helpers and plugins also install:
bun add better-auth/next-js
```

2) Environment variables

Create a `.env` file in the project root (or copy from `.env.example`) and set:

```
BETTER_AUTH_SECRET=your_32+_char_secret_here
BETTER_AUTH_URL=http://localhost:3000
```

Tip: generate a secret with `openssl rand -base64 32`.

3) Create your auth instance

Create `apps/web/lib/betterAuth.ts` (already present) and wire your adapter and secret. Example using the Prisma adapter:

```ts
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@/lib/prisma'

export const auth = betterAuth({
  adapter: prismaAdapter({ client: prisma }),
  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [/* e.g. nextCookies() */],
})
```

4) Mount the handler

For the App Router we provide `apps/web/app/api/auth/[...all]/route.ts` which maps Better Auth handlers to Next route handlers. Keep the file in place.

5) Generate and apply DB schema

Use the Better Auth CLI to generate the ORM schema or migrations:

```bash
# from apps/web
npx auth@latest generate
# merge the generated schema into your ORM (for Prisma: copy into prisma/schema.prisma)
npx prisma generate
npx prisma db push   # or `prisma migrate dev` if you prefer migrations
node prisma/seed.js  # optional seed step if present
```

6) Client

Create `apps/web/lib/auth-client.ts` (already present) and import it in your components:

```ts
import { authClient } from '@/lib/auth-client'
await authClient.signInEmail({ body: { email, password }})
```

7) Middleware / Proxy

To protect pages routes, use cookie-only checks in `proxy.ts` or server-side checks via `auth.api.getSession()` as documented in the library docs.

---
If you'd like I can run the generator inside the `web` container and merge the generated schema into your Prisma schema. Say `run generator` and I'll proceed.
