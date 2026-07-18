import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  BookOpen,
  Building2,
  Calculator,
  CheckCircle2,
  ClipboardList,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AccountantDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/auth/login');
  }

  // An accountant belongs to a firm, not a company — resolve their role and
  // client list from AccountantUser/AccountantAssignment instead.
  const accountantProfile = await prisma.accountantUser.findFirst({
    where: { userId: session.user.id },
    include: {
      accountant: {
        include: { assignments: { include: { company: { select: { name: true } } } } }
      }
    }
  });

  if (!accountantProfile) {
    redirect('/');
  }

  const isOwner = accountantProfile.accountant.ownerId === session.user.id;
  const userName = session.user.name || 'User';
  const clientNames = accountantProfile.accountant.assignments.map((a) => a.company.name);
  const companyName =
    clientNames.length === 0
      ? 'your clients'
      : clientNames.length === 1
        ? clientNames[0]
        : `${clientNames.length} client companies`;

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-slate-50 via-white to-emerald-50">
      {/* Header banner */}
      <div className="relative bg-linear-to-r from-emerald-700 to-teal-800 py-8 text-white shadow-lg">
        <div className="absolute inset-0 opacity-[0.03]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/30 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Calculator className="h-3 w-3" />
              Accountant Portal
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back, {userName}!
            </h1>
            <div className="flex items-center gap-2 text-emerald-100">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">{companyName}</span>
              <span className="text-emerald-300">•</span>
              <span className="text-sm text-emerald-200">
                {isOwner ? 'Firm Owner' : 'Accountant'}
              </span>
              <span className="text-emerald-300">•</span>
              <span className="text-sm text-emerald-200">
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

      <div className="container mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
        {/* Role-specific welcome card */}
        <Card className="overflow-hidden border-none shadow-md">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Accountant Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {isOwner
                ? `As the owner of this firm, you have full access to the accounting portal for ${companyName}. You can manage your accountant team, review all financial entries, and oversee accounting operations.`
                : `Welcome to the accounting portal for ${companyName}. You have access to review financial entries for your firm's assigned clients.`}
            </p>
          </CardContent>
        </Card>

        {/* Module cards */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            Your Modules
            <span className="ml-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
              Accountant Portal
            </span>
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Setup Wizard Module - NEW */}
            <Card className="overflow-hidden border border-emerald-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-emerald-50/30">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-emerald-900">
                  Client Setup Monitor
                </CardTitle>
                <ClipboardList className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">Setup Progress</div>
                <p className="mt-1 text-xs text-emerald-700">
                  Monitor onboarding and configuration status for all your client companies.
                </p>
                <Button 
                    className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                    size="sm"
                    asChild
                >
                    <a href="/accountant-dashboard/setup">Manage Client Onboarding</a>
                </Button>
              </CardContent>
            </Card>

            {/* Dashboard module — available to both */}
            <Card className="overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-800">
                  <Calculator className="h-5 w-5 text-emerald-600" />
                  Accounting Overview
                </CardTitle>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                  Active
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Central hub for all your accounting tasks and financial records.
                </p>
              </CardContent>
            </Card>

            {/* Staff management — firm owner only */}
            {isOwner && (
              <Card className="overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-800">
                    <Users className="h-5 w-5 text-indigo-600" />
                    Staff Management
                  </CardTitle>
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                    Owner
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Add accountants to your firm and manage their client assignments.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Tasks module — available to both */}
            <Card className="overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-800">
                  <ClipboardList className="h-5 w-5 text-amber-600" />
                  Tasks & Reviews
                </CardTitle>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  Coming Soon
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Track assigned tasks and pending accounting reviews.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400">
          Accountant Portal • {new Date().getFullYear()} • Secure accounting management
        </div>
      </div>
    </div>
  );
}
