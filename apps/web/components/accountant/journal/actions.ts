'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type JournalEntryLine = {
  accountId: string;
  debit: number | null;
  credit: number | null;
  description?: string | null;
};
export interface Customer {
  id: string;
  displayName: string;
  // ... other customer fields
}
export interface JournalEntry {
  id: string;
  date: Date;
  journalNo: string | null;
  transactionType: string;
  description: string | null;
  customerId: string | null;
  companyId: string;
  entries: JournalEntryLine[];
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer | null;
}
export type CreateJournalEntryData = {
  date: Date;
  journalNo: string;
  description?: string;
  customerId?: string;
  entries: JournalEntryLine[];
};

export interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  redirect?: string;
}

export async function getNextJournalNumber(): Promise<ActionResponse<string>> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    // Find the last journal entry for this company
    const lastEntry = await prisma.journalEntry.findFirst({
      where: {
        companyId: session.user.activeCompanyId,
        isActive: true
      },
      orderBy: { journalNo: 'desc' },
      select: { journalNo: true }
    });

    // If no entries exist, start from 1
    if (!lastEntry?.journalNo) {
      return { success: true, data: '1' };
    }

    // Increment the last number by 1
    const nextNumber = parseInt(lastEntry.journalNo) + 1;
    return { success: true, data: nextNumber.toString() };
  } catch (error) {
    console.error('Error getting next journal number:', error);
    return { success: false, error: 'Failed to get next journal number' };
  }
}

export async function createJournalEntry(
  data: CreateJournalEntryData
): Promise<ActionResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    // Validate debits = credits
    const totalDebits = data.entries.reduce(
      (sum, entry) => sum + (entry.debit || 0),
      0
    );
    const totalCredits = data.entries.reduce(
      (sum, entry) => sum + (entry.credit || 0),
      0
    );

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return { success: false, error: 'Total debits must equal total credits' };
    }

    // Create the journal entry with its lines
    await prisma.journalEntry.create({
      data: {
        transactionType: 'Journal',
        date: data.date,
        journalNo: data.journalNo,
        description: data.description,
        customerId: data.customerId,
        companyId: session.user.activeCompanyId,
        isActive: true,
        entries: {
          create: data.entries.map((entry) => ({
            accountId: entry.accountId,
            debit: entry.debit,
            credit: entry.credit,
            description: entry.description,
            isActive: true
          }))
        }
      }
    });

    revalidatePath('/journals');
    return { success: true };
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return { success: false, error: 'Failed to create journal entry' };
  }
}

export async function updateJournalEntry(
  journalId: string,
  data: CreateJournalEntryData
): Promise<ActionResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    // Validate debits = credits
    const totalDebits = data.entries.reduce(
      (sum, entry) => sum + (entry.debit || 0),
      0
    );
    const totalCredits = data.entries.reduce(
      (sum, entry) => sum + (entry.credit || 0),
      0
    );

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return { success: false, error: 'Total debits must equal total credits' };
    }

    // Instead of deleting, soft delete by setting isActive to false
    await prisma.$transaction(async (tx) => {
      // Soft delete existing entries
      await tx.journalEntryLine.updateMany({
        where: { journalEntryId: journalId, isActive: true },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Deactivated during journal update'
        }
      });

      // Update journal entry
      await tx.journalEntry.update({
        where: { id: journalId },
        data: {
          date: data.date,
          journalNo: data.journalNo,
          description: data.description,
          customerId: data.customerId,
          entries: {
            create: data.entries.map((entry) => ({
              accountId: entry.accountId,
              debit: entry.debit,
              credit: entry.credit,
              description: entry.description,
              isActive: true
            }))
          }
        }
      });
    });

    revalidatePath('/journals');
    return { success: true };
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return { success: false, error: 'Failed to update journal entry' };
  }
}
export async function fetchJournalEntry(
  id: string
): Promise<ActionResponse<JournalEntry>> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    const journal = await prisma.journalEntry.findUnique({
      where: {
        id,
        isActive: true
      },
      include: {
        entries: {
          where: { isActive: true },
          include: {
            account: true
          }
        },
        customer: true
      }
    });

    if (!journal) {
      return { success: false, error: 'Journal entry not found' };
    }

    return { success: true, data: journal };
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    return { success: false, error: 'Failed to fetch journal entry' };
  }
}

// Add a function for deleting journal entries (soft delete)
export async function deleteJournalEntry(id: string): Promise<ActionResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    await prisma.$transaction(async (tx) => {
      // Soft delete associated journal entry lines
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
        where: { id },
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
    console.error('Error deleting journal entry:', error);
    return { success: false, error: 'Failed to delete journal entry' };
  }
}
