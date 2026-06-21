import { notFound } from 'next/navigation';
import { fetchJournalEntry } from '@/components/accountant/journal/actions';
import { EditJournalForm } from '@/components/accountant/journal/edit';

export default async function EditJournalPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const pageParams = await params;
  const response = await fetchJournalEntry(pageParams.id);

  if (!response.success || !response.data) {
    notFound();
  }

  return (
    <EditJournalForm initialJournal={response.data} journalId={pageParams.id} />
  );
}
