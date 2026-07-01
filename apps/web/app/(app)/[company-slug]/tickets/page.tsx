import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTickets } from '@/components/tickets/actions';
import { NewTicketButton } from '@/components/tickets/new-ticket-button';
import { TicketList } from '@/components/tickets/ticket-list';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function TicketsPage({
  params
}: {
  params: Promise<{ 'company-slug': string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return null;

  const { 'company-slug': companySlug } = await params;
  
  const company = await prisma.company.findUnique({
    where: { slug: companySlug }
  });

  if (!company) notFound();

  const tickets = await getTickets(company.id);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-playfair text-navy">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">View and manage your support requests with our experts.</p>
        </div>
        <NewTicketButton companyId={company.id} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TicketList tickets={tickets} baseUrl={`/${companySlug}/tickets`} />
      </div>
    </div>
  );
}
