import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function RootPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/auth/login');
  }

  // 1. Admin redirection
  if (session.user.role === 'ADMIN') {
    redirect('/admin');
  }

  // 2. Accountant redirection
  if (session.user.isAccountant) {
    redirect('/accountant-dashboard');
  }

  // 3. Company Redirection Logic
  const user = session.user;
  const availableCompanies = user.availableCompanies || [];

  // If no companies, they must create one (or they are lost)
  if (availableCompanies.length === 0) {
    redirect('/create-company');
  }

  // If they have an active company set and it's in their available list, go there
  if (user.activeCompanyId) {
    const activeComp = availableCompanies.find(c => c.companyId === user.activeCompanyId);
    if (activeComp) {
      redirect(`/${activeComp.slug}`);
    }
  }

  // If they only have one company, just go there (and maybe set it as active in the background)
  if (availableCompanies.length === 1) {
    const comp = availableCompanies[0];
    if (comp) {
      // Auto-set as active if not set
      await prisma.user.update({
        where: { id: user.id },
        data: { activeCompanyId: comp.companyId }
      });

      return redirect(`/${comp.slug}`);
    }
  }

  // For multiple companies without an active selection, go to selection screen
  redirect('/select-company');
}
