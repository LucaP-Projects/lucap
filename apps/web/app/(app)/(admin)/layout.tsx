import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/auth/login');
  }

  // Only global admins allowed here
  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return <>{children}</>;
}
