import Link from 'next/link';
import { ChevronRight, ShieldCheck, UserPlus } from 'lucide-react';
import { getAllAccountantsForAdmin, createAccountant } from '@/components/accountant/actions';
import { createAuthUser } from '@/components/admin/user-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default async function AdminAccountantsPage() {
  const accountants = await getAllAccountantsForAdmin();

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Accountant Firms</h1>
        <p className="mt-1 text-muted-foreground">Manage accountant profiles and their staff.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {accountants.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No accountant firms yet.
            </CardContent>
          </Card>
        )}

        {accountants.map((a: any) => (
          <Link key={a.id} href={`/admin/accountants/${a.id}`}>
            <Card className="transition-colors hover:border-primary/50 hover:shadow-md">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{a.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {a.users?.length ?? 0} staff • {a.assignments?.length ?? 0} client
                      {a.assignments?.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create new Accountant</CardTitle>
            <CardDescription>Set up a new accounting firm on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData: FormData) => {
                'use server';
                const name = String(formData.get('name'));
                const slug = String(formData.get('slug') || undefined);
                if (!name) return;
                await createAccountant(name, slug);
              }}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <Input name="name" placeholder="Firm name" className="flex-1" />
              <Input name="slug" placeholder="slug (optional)" className="sm:w-48" />
              <Button type="submit">Create</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4" />
              Invite User
            </CardTitle>
            <CardDescription>Create an auth account for a new user.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData: FormData) => {
                'use server';
                const email = String(formData.get('email'));
                const name = String(formData.get('name') || '');
                if (!email) return;
                await createAuthUser({ email, name });
              }}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <Input name="email" placeholder="email@domain" className="flex-1" />
              <Input name="name" placeholder="Full name" className="sm:w-48" />
              <Button type="submit">Invite</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
