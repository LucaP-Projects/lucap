import { RoleManager } from '@/components/company/roles/role-manager';
import { getSessionWithCompany } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function TeamSettingsPage() {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) {
    redirect('/');
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Team & Roles</h1>
        <p className="text-muted-foreground">Manage your company roles and permissions.</p>
      </div>

      <div className="grid gap-6">
        <RoleManager companyId={session.user.activeCompanyId} />
      </div>
    </div>
  );
}
