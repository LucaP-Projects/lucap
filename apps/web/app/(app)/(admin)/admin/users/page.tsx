import { headers } from 'next/headers';
import Link from 'next/link';
import { listUsers } from '@/components/admin/user-actions';
import { setUserRole } from '@/components/admin/user-actions';

export default async function AdminUsersPage() {
  const result = await listUsers(200, 0) as any;
  const users = result?.users ?? [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage application users via BetterAuth admin plugin.</p>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full table-fixed">
          <thead>
            <tr className="text-left">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Roles</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-t">
                <td className="p-4">{u.name}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4">{Array.isArray(u.roles) ? u.roles.join(', ') : u.role}</td>
                <td className="p-4">
                  <form action={async (formData: FormData) => {
                    'use server';
                    const role = String(formData.get('role'));
                    await setUserRole(u.id, role);
                  }}>
                    <select name="role" defaultValue={Array.isArray(u.roles) ? u.roles[0] : u.role} className="mr-2">
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    <button type="submit" className="px-3 py-1 bg-navy text-white rounded">Set</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
