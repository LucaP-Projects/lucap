// actions/journal.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export type FetchJournalsParams = {
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
};

export async function fetchJournals({
  dateFrom,
  dateTo,
  page = 1,
  limit = 10
}: FetchJournalsParams = {}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    const where = {
      companyId: session.user.companyId,
      isActive: true,
      ...(dateFrom && dateTo
        ? {
            date: {
              gte: dateFrom,
              lte: dateTo
            }
          }
        : {})
    };

    const [journals, total] = await Promise.all([
      db.journalEntry.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              displayName: true
            }
          },
          entries: {
            where: { isActive: true },
            include: {
              account: {
                select: {
                  id: true,
                  title: true,
                  number: true
                }
              }
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.journalEntry.count({ where })
    ]);

    return {
      success: true,
      data: {
        journals,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit
        }
      }
    };
  } catch (error) {
    console.error('Error fetching journals:', error);
    return { success: false, error: 'Failed to fetch journals' };
  }
}

export async function deleteJournal(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    // Soft delete the journal entry and its lines using a transaction
    await db.$transaction(async (tx) => {
      // Soft delete journal entry lines
      await tx.journalEntryLine.updateMany({
        where: {
          journalEntryId: id,
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent journal entry deactivated'
        }
      });

      // Soft delete the journal entry
      await tx.journalEntry.update({
        where: {
          id,
          companyId: session.user.companyId
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Journal entry deactivated by user'
        }
      });
    });

    revalidatePath('/journals');
    return { success: true };
  } catch (error) {
    console.error('Error deleting journal:', error);
    return { success: false, error: 'Failed to delete journal' };
  }
}
