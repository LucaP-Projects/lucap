import { JournalEntry } from './actions';
import JournalEntryForm from './journal';

interface EditJournalFormProps {
  initialJournal: JournalEntry;
  journalId: string;
}

export function EditJournalForm({
  initialJournal,
  journalId
}: EditJournalFormProps) {
  return (
    <JournalEntryForm
      mode="edit"
      journalId={journalId}
      initialData={{
        date: new Date(initialJournal.date),
        journalNo: initialJournal.journalNo || '',
        description: initialJournal.description || '',
        customerId: initialJournal.customerId || '',
        entries: initialJournal.entries.map((entry) => ({
          accountId: entry.accountId,
          customerId: '',
          debit: entry.debit,
          credit: entry.credit,
          description: entry.description || ''
        }))
      }}
    />
  );
}
