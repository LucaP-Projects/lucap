import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GraduationCap, Calendar, Receipt, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';
import { getCustomer } from '../actions';

interface CustomerPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerPage({ params }: CustomerPageProps) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) notFound();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">{customer.displayName}</h1>
          <p className="text-muted-foreground">
            Customer since {formatDate(customer.createdAt)}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link href="/customers">Back to Customers</Link>
          </Button>
          <Button>Edit Customer</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className={`bg-green-500/10 text-green-500`}
            >
              {customer.customerPaymentEvents[0]?.status || 'INACTIVE'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Children</CardTitle>
            <GraduationCap className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customer.subCustomers.length}
            </div>
            <p className="text-muted-foreground text-xs">Enrolled Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customer.customerPaymentEvents.length}
            </div>
            <p className="text-muted-foreground text-xs">Payment Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Invoices
            </CardTitle>
            <Receipt className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.invoices.length}</div>
            <p className="text-muted-foreground text-xs">Total Invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Email
              </dt>
              <dd className="text-sm font-medium">{customer.primaryEmail}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Phone
              </dt>
              <dd className="text-sm font-medium">
                {customer.primaryPhone || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Address
              </dt>
              <dd className="text-sm font-medium">
                {JSON.stringify(customer?.billingAddress) || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-medium">ID</dt>
              <dd className="text-sm font-medium">{customer.id}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="children" className="space-y-4">
        <TabsList>
          <TabsTrigger value="children">Children</TabsTrigger>
          <TabsTrigger value="payments">Payment Events</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Renewal Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.customerPaymentEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{event.version.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{event.status}</Badge>
                        </TableCell>
                        <TableCell>${event.version.name}</TableCell>
                        <TableCell>{formatDate(event.startDate)}</TableCell>
                        <TableCell>
                          {event.endDate ? formatDate(event.endDate) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice Number</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.number}</TableCell>
                        <TableCell>
                          {customer.subCustomers.find(
                            (s) => s.id === invoice.customerId
                          )?.displayName || '-'}
                        </TableCell>
                        <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{invoice.status}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                        <TableCell>{invoice.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
