import Link from 'next/link';
import { Calendar, CreditCard, FileText, Tags, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function FinancePage() {
  const navigationCards = [
    {
      title: 'Invoices',
      description:
        'Generate, manage and track customer invoices with automated reminders',
      icon: FileText,
      href: '/finance/invoices',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Payment Events',
      description:
        'Schedule and monitor recurring payments and one-time transactions',
      icon: Calendar,
      href: '/finance/payment-events',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Transactions',
      description:
        'Comprehensive overview of all financial activities and operations',
      icon: CreditCard,
      href: '/finance/transactions',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Categories',
      description:
        'Manage and organize transaction categories for better financial tracking',
      icon: Tags,
      href: '/finance/categories',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'Reports & Analytics',
      description:
        'In-depth financial insights with customizable reporting tools',
      icon: TrendingUp,
      href: '/finance/reports',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    }
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6">
          {/* Header Section */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
              Finance Management
            </h1>
            <p className="text-gray-500">
              Monitor and manage your financial operations in one place
            </p>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {navigationCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link href={card.href} key={card.title}>
                  <Card className="group h-full cursor-pointer border-none ring-1 ring-gray-200 transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-gray-300">
                    <CardHeader>
                      <div
                        className={`${card.bgColor} mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-transform group-hover:scale-110`}
                      >
                        <Icon className={`h-6 w-6 ${card.color}`} />
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        {card.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-gray-500">
                        {card.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinancePage;
