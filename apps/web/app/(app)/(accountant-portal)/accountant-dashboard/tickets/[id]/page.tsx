import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTicket } from '@/components/tickets/actions';
import { TicketThread } from '@/components/tickets/ticket-thread';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default async function AccountantTicketDetailPage({
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

  // Helper function for the action (note: in a server component, we usually use forms or client-side wrap)
  // For simplicity here, I'll just show the UI. A real implementation would use a client component for the status switcher.

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${companySlug}/accountant-dashboard/tickets`}>
            <i className="fa-solid fa-arrow-left mr-2" />
            Back to Triage
          </Link>
        </Button>

        <div className="flex items-center gap-4">
           <span className="text-sm font-medium text-gray-500">Ticket Status:</span>
           {/* In a real app, this would be a Client Component for interactivity */}
           <Badge variant="outline" className="h-9 px-4 uppercase font-bold bg-white">
              {ticket.status}
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h1 className="text-2xl font-bold font-playfair text-navy-dark mb-2">{ticket.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Client: <span className="text-navy font-semibold">{ticket.company?.name}</span></span>
              <span>•</span>
              <span>Opened by: {ticket.createdBy?.name || 'Unknown'}</span>
              <span>•</span>
              <span>ID: #{ticket.id.slice(0, 8)}</span>
            </div>
          </div>

          <TicketThread 
            ticketId={ticket.id}
            initialMessages={ticket.messages.map(m => ({
              ...m,
              date: new Date(m.date)
            }))}
            currentUserName={session.user.name || 'Accountant Staff'}
          />
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 text-navy">Client Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Company</span>
                <span className="font-medium">{ticket.company?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contact</span>
                <span className="font-medium">{ticket.createdBy?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-xs">{ticket.createdBy?.email}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 text-navy">Internal Actions</h3>
            <div className="space-y-4">
               <Button variant="outline" className="w-full justify-start text-xs h-10">
                 <i className="fa-solid fa-note-sticky mr-2 text-yellow-600" />
                 Add internal note
               </Button>
               <Button variant="outline" className="w-full justify-start text-xs h-10">
                 <i className="fa-solid fa-phone mr-2 text-green-600" />
                 Log a call
               </Button>
               <Button variant="outline" className="w-full justify-start text-xs h-10">
                 <i className="fa-solid fa-clock-rotate-left mr-2 text-blue-600" />
                 Action history
               </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Minimal Card component since I don't want to over-import for this scaffold
function Card({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("bg-white rounded-lg border shadow-sm", className)}>
      {children}
    </div>
  );
}
