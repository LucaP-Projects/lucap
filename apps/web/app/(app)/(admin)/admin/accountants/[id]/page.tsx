import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import {
  addUserToAccountant,
  assignCompanyToAccountant,
  getAccountantByIdForAdmin
} from '@/components/accountant/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { prisma } from '@/lib/prisma';

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50';

export default async function AdminAccountantDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const accountant = await getAccountantByIdForAdmin(id);

  if (!accountant) {
    notFound();
  }

  const assignedCompanyIds = new Set(accountant.assignments.map((a) => a.companyId));
  const availableCompanies = await prisma.company.findMany({
    where: { id: { notIn: [...assignedCompanyIds] }, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      <div>
        <Link
          href="/admin/accountants"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Accountant Firms
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{accountant.name}</h1>
        <p className="mt-1 text-muted-foreground">
          Owner: {accountant.owner?.name || accountant.owner?.email || 'Unknown'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Staff ({accountant.users.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {accountant.users.length === 0 && (
                <p className="text-sm text-muted-foreground">No staff yet.</p>
              )}
              {accountant.users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between border-t pt-2 text-sm first:border-t-0 first:pt-0"
                >
                  <span>{u.user.name || u.user.email}</span>
                  {u.userId === accountant.ownerId && <Badge>Owner</Badge>}
                </div>
              ))}
            </div>
            <form
              action={async (formData: FormData) => {
                'use server';
                const email = String(formData.get('email') || '').trim();
                if (!email) return;
                const user = await prisma.user.findUnique({ where: { email } });
                if (!user) return;
                await addUserToAccountant(accountant.id, user.id);
              }}
              className="flex gap-2"
            >
              <Input name="email" placeholder="user@email.com" className="flex-1" />
              <Button type="submit" size="sm">
                Add
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Client Companies ({accountant.assignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {accountant.assignments.length === 0 && (
                <p className="text-sm text-muted-foreground">No client companies yet.</p>
              )}
              {accountant.assignments.map((a) => (
                <div key={a.id} className="border-t pt-2 text-sm first:border-t-0 first:pt-0">
                  {a.company.name}
                </div>
              ))}
            </div>
            <form
              action={async (formData: FormData) => {
                'use server';
                const companyId = String(formData.get('companyId') || '');
                if (!companyId) return;
                await assignCompanyToAccountant(accountant.id, companyId);
              }}
              className="flex gap-2"
            >
              <select name="companyId" className={`${selectClassName} flex-1`}>
                {availableCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button type="submit" size="sm" disabled={availableCompanies.length === 0}>
                Assign
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
