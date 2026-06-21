// app/journals/new/page.tsx
import { Metadata } from 'next';
import { JournalEntryForm } from '@/components/accountant/journal/journal';

export const metadata: Metadata = {
  title: 'New Journal Entry',
  description: 'Create a new journal entry'
};

export default function NewJournalPage() {
  return <JournalEntryForm />;
}
