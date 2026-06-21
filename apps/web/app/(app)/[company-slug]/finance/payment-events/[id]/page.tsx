import { PaymentStatus } from '@/lib/generated/prisma/client';
import { format } from 'date-fns';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, ChevronLeft, PlusCircle } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import PaymentEventOverview, {
  statusColorMap
} from '@/components/payment-event/details/payment-event-overview';
import PaymentEventStatistics from '@/components/payment-event/details/payment-event-statistics';
import InvoicesList from '@/components/payment-event/invoices/invoice-list';
import { prisma } from '@/lib/prisma';

import { formatCurrency } from '@/lib/utils';
import { VersionActivateButton } from './activebutton';

export async function getPaymentEventDetails(id: string) {
  const event = await prisma.paymentEvent.findUnique({
    where: { id },
    include: {
      currentVersion: true,
      versions: {
        orderBy: {
          version: 'desc'
        }
      },

      customerPaymentEvents: {
        include: {
          customer: true,
          invoices: {
            include: {
              payments: true
            }
          }
        }
      }
    }
  });

  return event;
}

export default async function PaymentEventDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const paramsPaymentEventDetails = await params;
  const event = await getPaymentEventDetails(paramsPaymentEventDetails.id);

  if (!event) {
    notFound();
  }

  const paymentStatusColorMap: Record<PaymentStatus, string> = {
    PENDING: 'bg-yellow-500',
    PAID: 'bg-green-500',
    OVERDUE: 'bg-red-500',
    CANCELLED: 'bg-gray-500',
    PARTIAL: 'bg-blue-500'
  };
  const getVersionAmount = () => {
    const settings = event.currentVersion?.paymentSettings?.settings;

    if (!settings) return 0;

    switch (event.type) {
      case 'ONE_TIME':
        return (settings as PrismaJson.OneTimeSettings).amount || 0;
      case 'SUBSCRIPTION':
        return (settings as PrismaJson.SubscriptionSettings).amount || 0;
      case 'INSTALLMENTS':
        return (settings as PrismaJson.InstallmentSettings).totalAmount || 0;
      default:
        return 0;
    }
  };
  return (
    // <PaymentEventDetails event={event} />

    <div className="flex h-full flex-col">
      {/* Compact Header Area */}
      <div className="flex items-center gap-x-4 border-b px-4 py-2">
        <Link href="/finance/payment-events">
          <Button variant="ghost" size="sm" className="h-8 gap-x-1">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {event.currentVersion?.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Payment Event Details and Management
          </p>
        </div>
      </div>

      {/* Scrollable Content Area */}

      <div className="space-y-4 py-4">
        {/* Cards Grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Overview Card */}
          <PaymentEventOverview event={event} />

          {/* Statistics Card */}
          <PaymentEventStatistics event={event} />
        </div>

        {/* Tabs Section */}

        <Tabs defaultValue="assignments" className="w-full">
          <TabsList className="flex w-full flex-wrap sm:flex-nowrap">
            <TabsTrigger value="assignments" className="flex-1 sm:flex-none">
              Assignments
            </TabsTrigger>
            <TabsTrigger value="versions" className="flex-1 sm:flex-none">
              Versions
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex-1 sm:flex-none">
              Invoices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Member Assignments</CardTitle>
                <CardDescription>
                  List of all members assigned to this payment event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full sm:h-[600px]">
                  <div className="space-y-4">
                    {event.customerPaymentEvents.map((mpe) => (
                      <div
                        key={mpe.id}
                        className="flex flex-col justify-between space-y-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:space-y-0"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">
                            {mpe.customer?.displayName}
                          </p>
                          <div className="text-muted-foreground flex items-center gap-2 text-sm">
                            <CalendarDays className="h-4 w-4 shrink-0" />
                            <span className="break-all">
                              {format(mpe.startDate, 'PPP')}
                              {mpe.endDate &&
                                ` - ${format(mpe.endDate, 'PPP')}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
                          <div className="text-right">
                            <p className="text-sm font-medium">Credit</p>
                            <p className="text-muted-foreground text-sm">
                              {formatCurrency(mpe.credit)}
                            </p>
                          </div>
                          <Badge className={paymentStatusColorMap[mpe.status]}>
                            {mpe.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="versions" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <CardTitle>Version History</CardTitle>
                  <CardDescription>
                    Track and manage payment event versions
                  </CardDescription>
                </div>
                {event.currentVersion?.type.toLowerCase() && (
                  <Link
                    href={`/finance/payment-events/${event.id}/versions/${event.currentVersion?.type.toLowerCase()}`}
                    className="w-full sm:w-auto"
                  >
                    <Button className="w-full sm:w-auto">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New Version
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full sm:h-[600px]">
                  <div className="space-y-4">
                    {event.versions.map((version) => (
                      <div
                        key={version.id}
                        className="flex flex-col justify-between space-y-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:space-y-0"
                      >
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-medium">{version.name}</h4>
                            <Badge className={statusColorMap[version.status]}>
                              v{version.version}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground break-words text-sm">
                            {version.description || 'No description'}
                          </p>
                          <div className="text-muted-foreground flex flex-col gap-2 text-sm sm:flex-row">
                            <span>
                              Created: {format(version.createdAt, 'PPP')}
                            </span>
                            <span>
                              Amount: {formatCurrency(getVersionAmount())}
                            </span>
                          </div>
                        </div>
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                          <Link
                            href={`/finance/payment-events/${event.id}/versions`}
                            className="w-full sm:w-auto"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto"
                            >
                              View Details
                            </Button>
                          </Link>
                          {version.status === 'DRAFT' && (
                            <VersionActivateButton
                              versionId={version.id}
                              version={version}
                              pendingPaymentsCount={
                                event.customerPaymentEvents.filter(
                                  (cpe: any) => cpe.status === 'PENDING'
                                ).length
                              }
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <InvoicesList
            event={event}
            paymentStatusColorMap={paymentStatusColorMap}
          />
        </Tabs>
      </div>
    </div>
  );
}
