import { getCustomerCount } from '@/components/shared/customer/actions';
import { getPendingInvoicesCount } from '@/components/shared/invoice/actions';
import { getActiveSubscriptionsCount } from '@/components/payment-event/assignment/subscription/assign-action';
import { auth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  ArrowRightCircle,
  BanknoteIcon,
  BarChart3,
  Building2,
  ClipboardCheck,
  Clock,
  CreditCard,
  FileText,
  RefreshCcw,
  Users,
  Wallet,
  DollarSign,
  Receipt
} from 'lucide-react';

import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { env } from 'process';
import { headers } from 'next/headers';

async function WelcomePage() {
  const session = await auth.api.getSession({headers: await headers()});
  const t = await getTranslations('AppLayout');
  // Redirect if no session
  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;
  const companyId = session.user.companyId;

  // Fetch customer count
  let customerCount = 'Loading...';
  try {
    if (companyId) {
      const count = await getCustomerCount(companyId);
      customerCount = count.toString();
    }
  } catch (error) {
    console.error('Error fetching customer count:', error);
    customerCount = 'Error';
  }

  let subscriptionsCount = 'Loading...';
  try {
    if (companyId) {
      const count = await getActiveSubscriptionsCount(companyId);
      subscriptionsCount = count.toString();
    }
  } catch (error) {
    console.error('Error fetching subscriptions count:', error);
    subscriptionsCount = 'Error';
  }

  let pendingInvoicesCount = 'Loading...';
  try {
    if (companyId) {
      const count = await getPendingInvoicesCount(companyId);
      pendingInvoicesCount = count.toString();
    }
  } catch (error) {
    console.error('Error fetching pending invoices count:', error);
    pendingInvoicesCount = 'Error';
  }

  const metrics = [
    {
      title: 'Total Customers',
      icon: Users,
      value: customerCount,
      description: 'Active customers in your company',

      trendUp: true,
      color: 'from-blue-500 to-indigo-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Revenue Today',
      icon: CreditCard,
      value: '$0.00',
      description: 'Revenue generated today',

      trendUp: true,
      color: 'from-green-500 to-emerald-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Pending Invoices',
      icon: FileText,
      value: pendingInvoicesCount,
      description: 'Invoices awaiting payment',

      trendUp: false,
      color: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-700'
    },
    {
      title: 'Subscriptions',
      icon: Activity,
      value: subscriptionsCount,
      description: 'Current active subscriptions',

      trendUp: true,
      color: 'from-purple-500 to-pink-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-700'
    }
  ];

  const currentCompany = user.availableCompanies?.find(
    (company) => company.companyId === companyId
  );

  return (
    <div className="bg-linear-to-b flex min-h-screen flex-col from-slate-50 via-white to-blue-50">
      <div className="bg-linear-to-r relative from-blue-700 to-indigo-800 py-6 text-white shadow-lg md:py-6">
        <div className="absolute inset-0 opacity-[0.03]" />
        <div className="bg-linear-to-r absolute bottom-0 left-0 right-0 h-px from-transparent via-white/30 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-8 space-y-4">
            <div className="inline-block rounded-full bg-blue-600/30 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              {t('profile')}
            </div>
            <h1 className="animate-fade-in text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <div className="flex items-center space-x-2 text-blue-100">
              <Building2 className="h-5 w-5" />
              <span className="font-medium">
                {currentCompany?.name || 'Company'}
              </span>
              <span className="text-blue-300">•</span>
              <span className="text-sm text-blue-200">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 md:py-12">
        {/* Metrics Section */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <Card
              key={index}
              className="animate-fade-in overflow-hidden border-none transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`bg-linear-to-r h-1 w-full ${metric.color}`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <div className={`rounded-full ${metric.bgLight} p-2`}>
                  <metric.icon className={`h-4 w-4 ${metric.textColor}`} />
                </div>
              </CardHeader>
              <CardContent className="pb-4 pt-4">
                <div className="text-3xl font-extrabold tracking-tight">
                  {metric.value}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-500">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Primary Financial Services */}
        <div className="mt-10">
          <h2 className="mb-5 flex items-center text-xl font-semibold text-gray-800">
            <BarChart3 className="mr-2 h-5 w-5 text-indigo-600" />
            Primary Financial Services
            <span className="ml-2 rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
              Core Operations
            </span>
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Invoices */}
            <Link
              href={`/invoices`}
              className="group block transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Card className="h-full border border-gray-100 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-indigo-100 group-hover:shadow-md">
                <div className="bg-linear-to-r h-1 w-full from-green-500 to-emerald-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center text-base font-medium text-gray-800">
                    <FileText className="mr-2 h-5 w-5 text-green-600" />
                    Invoices
                  </CardTitle>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    {pendingInvoicesCount} pending
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">
                          Outstanding
                        </p>
                        <p className="text-lg font-bold text-gray-800">$0.00</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">
                          Paid
                        </p>
                        <p className="text-lg font-bold text-gray-800">$0.00</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">View all invoices</span>
                      <ArrowRightCircle className="h-4 w-4 text-gray-400 transition-colors group-hover:text-indigo-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Sales Receipts */}
            <Link
              href={`/salesreceipts`}
              className="group block transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Card className="h-full border border-gray-100 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-indigo-100 group-hover:shadow-md">
                <div className="bg-linear-to-r h-1 w-full from-blue-500 to-indigo-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center text-base font-medium text-gray-800">
                    <Receipt className="mr-2 h-5 w-5 text-blue-600" />
                    Sales Receipts
                  </CardTitle>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                    Transactions
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">
                          Total Sales
                        </p>
                        <p className="text-lg font-bold text-gray-800">$0.00</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">
                          Count
                        </p>
                        <p className="text-lg font-bold text-gray-800">0</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Manage receipts</span>
                      <ArrowRightCircle className="h-4 w-4 text-gray-400 transition-colors group-hover:text-indigo-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Estimates */}
            <Link
              href={`/estimates`}
              className="group block transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Card className="h-full border border-gray-100 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-indigo-100 group-hover:shadow-md">
                <div className="bg-linear-to-r h-1 w-full from-purple-500 to-pink-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center text-base font-medium text-gray-800">
                    <ClipboardCheck className="mr-2 h-5 w-5 text-purple-600" />
                    Estimates
                  </CardTitle>
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                    Proposals
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">
                          Active
                        </p>
                        <p className="text-lg font-bold text-gray-800">0</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">
                          Conversion
                        </p>
                        <p className="text-lg font-bold text-gray-800">0%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">View estimates</span>
                      <ArrowRightCircle className="h-4 w-4 text-gray-400 transition-colors group-hover:text-indigo-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Credit & Refund Services */}
        <div className="mt-10">
          <h2 className="mb-5 flex items-center text-xl font-semibold text-gray-800">
            <Wallet className="mr-2 h-5 w-5 text-amber-600" />
            Credit & Refund Management
            <span className="ml-2 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              Balance Adjustments
            </span>
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Credit Memos */}
            <Link
              href={`/creditmemos`}
              className="group block transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Card className="h-full border border-gray-100 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-amber-100 group-hover:shadow-md">
                <div className="bg-linear-to-r h-1 w-full from-amber-500 to-orange-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center text-base font-medium text-gray-800">
                    <DollarSign className="mr-2 h-5 w-5 text-amber-600" />
                    Credit Memos
                  </CardTitle>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    Credits
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">
                          Available
                        </p>
                        <p className="text-lg font-bold text-gray-800">$0.00</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">
                          Applied
                        </p>
                        <p className="text-lg font-bold text-gray-800">$0.00</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Manage credits</span>
                      <ArrowRightCircle className="h-4 w-4 text-gray-400 transition-colors group-hover:text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Refund Receipts */}
            <Link
              href={`/refundreceipts`}
              className="group block transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Card className="h-full border border-gray-100 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-red-100 group-hover:shadow-md">
                <div className="bg-linear-to-r h-1 w-full from-red-500 to-rose-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center text-base font-medium text-gray-800">
                    <RefreshCcw className="mr-2 h-5 w-5 text-red-600" />
                    Refund Receipts
                  </CardTitle>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                    Returns
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">
                          Processed
                        </p>
                        <p className="text-lg font-bold text-gray-800">$0.00</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">
                          Pending
                        </p>
                        <p className="text-lg font-bold text-gray-800">$0.00</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">View refunds</span>
                      <ArrowRightCircle className="h-4 w-4 text-gray-400 transition-colors group-hover:text-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Payment Processing */}
            <Link
              href={`/payment-processing`}
              className="group block transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Card className="h-full border border-gray-100 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-indigo-100 group-hover:shadow-md">
                <div className="bg-linear-to-r h-1 w-full from-indigo-500 to-blue-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center text-base font-medium text-gray-800">
                    <CreditCard className="mr-2 h-5 w-5 text-indigo-600" />
                    Payment Processing
                  </CardTitle>
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                    Transactions
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">
                          Today
                        </p>
                        <p className="text-lg font-bold text-gray-800">$0.00</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">
                          This Month
                        </p>
                        <p className="text-lg font-bold text-gray-800">$0.00</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Process payments</span>
                      <ArrowRightCircle className="h-4 w-4 text-gray-400 transition-colors group-hover:text-indigo-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Delayed Items */}
        <div className="mt-10">
          <h2 className="mb-5 flex items-center text-xl font-semibold text-gray-800">
            <Clock className="mr-2 h-5 w-5 text-blue-600" />
            Delayed Transactions
            <span className="ml-2 rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              Future Processing
            </span>
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Delayed Credits */}
            <Link
              href={`/delayedcredits`}
              className="group block transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Card className="h-full border border-gray-100 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-emerald-100 group-hover:shadow-md">
                <div className="bg-linear-to-r h-1 w-full from-emerald-500 to-teal-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center text-base font-medium text-gray-800">
                    <Activity className="mr-2 h-5 w-5 text-emerald-600" />
                    Delayed Credits
                  </CardTitle>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                    Future Credits
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">
                          Pending
                        </p>
                        <p className="text-lg font-bold text-gray-800">$0.00</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">
                          Total
                        </p>
                        <p className="text-lg font-bold text-gray-800">$0.00</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Manage delayed credits
                      </span>
                      <ArrowRightCircle className="h-4 w-4 text-gray-400 transition-colors group-hover:text-emerald-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Delayed Charges */}
            <Link
              href={`/delayedcharges`}
              className="group block transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Card className="h-full border border-gray-100 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-sky-100 group-hover:shadow-md">
                <div className="bg-linear-to-r h-1 w-full from-sky-500 to-blue-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center text-base font-medium text-gray-800">
                    <BanknoteIcon className="mr-2 h-5 w-5 text-sky-600" />
                    Delayed Charges
                  </CardTitle>
                  <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">
                    Future Charges
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">
                          Pending
                        </p>
                        <p className="text-lg font-bold text-gray-800">$0.00</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">
                          Total
                        </p>
                        <p className="text-lg font-bold text-gray-800">$0.00</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Manage delayed charges
                      </span>
                      <ArrowRightCircle className="h-4 w-4 text-gray-400 transition-colors group-hover:text-sky-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Footer area with subtle branding */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>
            Finance Dashboard • {new Date().getFullYear()} • Secure financial
            management
          </p>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
