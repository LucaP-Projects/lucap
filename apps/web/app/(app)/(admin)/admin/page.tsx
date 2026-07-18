import Link from 'next/link';
import { headers } from 'next/headers';
import { Building2, ShieldCheck, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const STATS = [
  { key: 'companies', title: 'Companies', href: '/admin/companies', icon: Building2 },
  { key: 'users', title: 'Users', href: '/admin/users', icon: Users },
  { key: 'accountants', title: 'Accountants', href: '/admin/accountants', icon: ShieldCheck }
] as const;

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const [companiesCount, usersCount, accountantsCount] = await Promise.all([
    prisma.company.count(),
    prisma.user.count(),
    prisma.accountant.count()
  ]);

  const counts: Record<(typeof STATS)[number]['key'], number> = {
    companies: companiesCount,
    users: usersCount,
    accountants: accountantsCount
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
        <p className="mt-1 text-muted-foreground">
          Manage global settings, companies, users, and accountants.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map(({ key, title, href, icon: Icon }) => (
          <Link key={key} href={href} className="block">
            <Card className="transition-colors hover:border-primary/50 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tracking-tight">{counts[key]}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
