'use client';

import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Ticket = {
  id: string;
  title: string;
  service: string | null;
  status: string;
  updatedAt: Date;
  messages: { message: string }[];
};

interface TicketListProps {
  tickets: Ticket[];
  baseUrl: string;
}

export function TicketList({ tickets, baseUrl }: TicketListProps) {
  const params = useParams();
  const companySlug = params['company-slug'] as string;

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPEN':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPEN':
        return 'Open';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'CLOSED':
        return 'Resolved';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      {tickets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <p>No tickets found.</p>
          </CardContent>
        </Card>
      ) : (
        tickets.map((ticket) => (
          <Link 
            key={ticket.id} 
            href={`${baseUrl}/${ticket.id}`}
            className="block transition-transform hover:scale-[1.01]"
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex flex-col gap-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#121c2c] truncate">{ticket.title}</span>
                    <Badge variant="outline" className={cn("text-[10px] uppercase font-bold", getStatusColor(ticket.status))}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-navy-light">{ticket.service || 'General Support'}</span>
                    <span>•</span>
                    <span>Updated {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate max-w-md">
                    {ticket.messages[0]?.message}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                   <div className="bg-navy rounded-full p-2 text-white">
                      <i className="fa-solid fa-chevron-right text-xs"></i>
                   </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
