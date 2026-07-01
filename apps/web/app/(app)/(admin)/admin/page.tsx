import Link from 'next/link';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const [companiesCount, usersCount, accountantsCount] = await Promise.all([
    prisma.company.count(),
    prisma.user.count(),
    prisma.accountant.count()
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Console</h1>
        <p className="text-muted-foreground mt-1">Manage global settings, companies, users, and accountants.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/companies" className="block">
          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h2 className="font-semibold">Companies</h2>
            <p className="text-3xl mt-4 font-black">{companiesCount}</p>
          </div>
        </Link>

        <Link href="/admin/users" className="block">
          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h2 className="font-semibold">Users</h2>
            <p className="text-3xl mt-4 font-black">{usersCount}</p>
          </div>
        </Link>

        <Link href="/admin/accountants" className="block">
          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h2 className="font-semibold">Accountants</h2>
            <p className="text-3xl mt-4 font-black">{accountantsCount}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
