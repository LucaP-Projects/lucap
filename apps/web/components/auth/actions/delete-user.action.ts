'use server';


import { APIError } from 'better-auth/api';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth, getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function deleteUserAction({ userId }: { userId: string }) {
  const headersList = await headers();

  const session = await getSessionWithCompany();

  if (!session) throw new Error('Unauthorized');

  if (session.user.role !== 'ADMIN' || session.user.id === userId) {
    throw new Error('Forbidden');
  }

  try {
    await prisma.user.delete({
      where: {
        id: userId,
      }
    });

    if (session.user.id === userId) {
      await auth.api.signOut({ headers: headersList });
      redirect('/auth/sign-in');
    }

    revalidatePath('/dashboard/admin');
    return { success: true, error: null };
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Internal Server Error' };
  }
}
