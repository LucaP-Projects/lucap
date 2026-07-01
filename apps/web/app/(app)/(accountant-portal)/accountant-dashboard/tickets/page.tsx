import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TicketList } from '@/components/tickets/ticket-list';
import { getTickets } from '@/components/tickets/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default async function AccountantTicketsPage({
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
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-playfair text-navy">Ticket Management</h1>
        <p className="text-muted-foreground mt-1">Manage support requests for {company.name}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="bg-blue-50/50 border-blue-100">
           <CardHeader className="pb-2">
             <CardTitle className="text-lg font-bold text-navy">Total</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-3xl font-black text-navy-dark">{tickets.length}</p>
           </CardContent>
         </Card>
         <Card className="bg-green-50/50 border-green-100">
           <CardHeader className="pb-2">
             <CardTitle className="text-lg font-bold text-green-700">Open</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-3xl font-black text-green-800">{tickets.filter(t => t.status === 'OPEN').length}</p>
           </CardContent>
         </Card>
         <Card className="bg-orange-50/50 border-orange-100">
           <CardHeader className="pb-2">
             <CardTitle className="text-lg font-bold text-orange-700">In Progress</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-3xl font-black text-orange-800">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</p>
           </CardContent>
         </Card>
         <Card className="bg-gray-50/50 border-gray-100">
           <CardHeader className="pb-2">
             <CardTitle className="text-lg font-bold text-gray-700">Resolved</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-3xl font-black text-gray-800">{tickets.filter(t => t.status === 'CLOSED').length}</p>
           </CardContent>
         </Card>
      </div>

      <div className="pt-4">
        <h2 className="text-xl font-bold font-playfair mb-4 text-navy">Recent Tickets</h2>
        <TicketList 
          tickets={tickets} 
          baseUrl={`/${companySlug}/accountant-dashboard/tickets`} 
        />
      </div>
    </div>
  );
}
