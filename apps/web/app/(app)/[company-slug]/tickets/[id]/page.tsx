import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTicket } from '@/components/tickets/actions';
import { TicketThread } from '@/components/tickets/ticket-thread';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function TicketDetailPage({
  params
}: {
  params: Promise<{ 'company-slug': string, id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return null;

  const { 'company-slug': companySlug, id } = await params;
  const ticket = await getTicket(id);

  if (!ticket) notFound();

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${companySlug}/tickets`}>
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Back
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-start border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-playfair text-navy-dark">{ticket.title}</h1>
            <Badge variant="outline" className="uppercase font-bold">
              {ticket.status === 'OPEN' ? 'Open' : ticket.status === 'CLOSED' ? 'Resolved' : 'In Progress'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground italic">
            Ticket #{ticket.id.slice(0, 8)} • Service: {ticket.service || 'Standard Support'}
          </p>
        </div>
      </div>

      <TicketThread 
        ticketId={ticket.id}
        initialMessages={ticket.messages.map(m => ({
          ...m,
          date: new Date(m.date)
        }))}
        currentUserName={session.user.name || 'Client'}
      />
    </div>
  );
}
