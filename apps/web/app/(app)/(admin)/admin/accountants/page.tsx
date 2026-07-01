import { headers } from 'next/headers';
import { getAccountantsForCurrentUser, createAccountant } from '@/components/accountant/actions';
import { createAuthUser } from '@/components/admin/user-actions';

export default async function AdminAccountantsPage() {
  const accountants = await getAccountantsForCurrentUser();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Accountant Firms</h1>
        <p className="text-muted-foreground mt-1">Manage accountant profiles and their staff.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {accountants.map((a: any) => (
          <div key={a.id} className="p-4 bg-white rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{a.name}</h3>
                <p className="text-sm text-muted-foreground">Users: {a.users?.length ?? 0} • Companies: {a.assignments?.length ?? 0}</p>
              </div>
              <div>
                <a className="text-sm text-navy" href={`/admin/accountants/${a.id}`}>Manage</a>
              </div>
            </div>
          </div>
        ))}

        <div className="p-4 bg-white rounded-lg border shadow-sm">
          <h3 className="font-semibold mb-2">Create new Accountant</h3>
          <form action={async (formData: FormData) => {
            'use server';
            const name = String(formData.get('name'));
            const slug = String(formData.get('slug') || undefined);
            if (!name) return;
            await createAccountant(name, slug);
          }}>
            <div className="flex gap-2">
              <input name="name" placeholder="Firm name" className="border p-2 rounded flex-1" />
              <input name="slug" placeholder="slug (optional)" className="border p-2 rounded w-48" />
              <button type="submit" className="px-4 py-2 bg-navy text-white rounded">Create</button>
            </div>
          </form>
        </div>

        <div className="p-4 bg-white rounded-lg border shadow-sm">
          <h3 className="font-semibold mb-2">Invite User (create auth user)</h3>
          <form action={async (formData: FormData) => {
            'use server';
            const email = String(formData.get('email'));
            const name = String(formData.get('name') || '');
            if (!email) return;
            await createAuthUser({ email, name });
          }}>
            <div className="flex gap-2">
              <input name="email" placeholder="email@domain" className="border p-2 rounded flex-1" />
              <input name="name" placeholder="Full name" className="border p-2 rounded w-48" />
              <button type="submit" className="px-4 py-2 bg-navy text-white rounded">Invite</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
