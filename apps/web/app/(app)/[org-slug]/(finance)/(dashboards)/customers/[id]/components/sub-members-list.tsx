'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface SubCustomersListProps {
  subCustomers: Array<{
    id: string;
    name: string;
    active: boolean;
    dateOfBirth: Date | null;
    paymentEvents: Array<{
      id: string;
      status: string;
      startDate: Date;
      endDate: Date | null;
      paymentEvent: {
        versions: Array<{
          name: string;
          amount: number;
        }>;
      };
    }>;
    invoices: Array<{
      id: string;
      number: string;
      amount: number;
      status: string;
      dueDate: Date;
    }>;
  }>;
}

export function SubCustomersList({ subCustomers }: SubCustomersListProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      PAID: 'bg-green-500/10 text-green-500',
      PENDING: 'bg-yellow-500/10 text-yellow-500',
      OVERDUE: 'bg-red-500/10 text-red-500',
      CANCELLED: 'bg-gray-500/10 text-gray-500'
    };
    return colors[status as keyof typeof colors] || colors.CANCELLED;
  };

  if (subCustomers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sub-Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No sub-customers found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sub-Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="space-y-4">
          {subCustomers.map((subCustomer) => (
            <AccordionItem key={subCustomer.id} value={subCustomer.id}>
              <AccordionTrigger className="px-4">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">{subCustomer.name}</span>
                    <Badge variant="outline">
                      {subCustomer.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {subCustomer.dateOfBirth && (
                    <span className="text-muted-foreground text-sm">
                      Born: {formatDate(subCustomer.dateOfBirth)}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium">Payment Events</h4>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subCustomer.paymentEvents.map((event) => (
                            <TableRow key={event.id}>
                              <TableCell>
                                {event.paymentEvent.versions[0].name}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={getStatusColor(event.status)}
                                >
                                  {event.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                $
                                {event.paymentEvent.versions[0].amount.toFixed(
                                  2
                                )}
                              </TableCell>
                              <TableCell>
                                {formatDate(event.startDate)}
                              </TableCell>
                              <TableCell>
                                {event.endDate
                                  ? formatDate(event.endDate)
                                  : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 font-medium">Recent Invoices</h4>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Number</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subCustomer.invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell>{invoice.number}</TableCell>
                              <TableCell>
                                ${invoice.amount.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={getStatusColor(invoice.status)}
                                >
                                  {invoice.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {formatDate(invoice.dueDate)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
