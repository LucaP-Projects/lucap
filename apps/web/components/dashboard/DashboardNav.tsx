import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Users,
  CreditCard,
  Settings,
  MessageSquare,
  FileText,
  CalendarDays,
  Store
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface DashboardNavProps {
  lng: string;
}

export function DashboardNav({ lng }: DashboardNavProps) {
  const pathname = usePathname();
  const t = useTranslations('dashboard');

  const navItems = [
    {
      title: t('nav.overview'),
      href: `/dashboard`,
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
      exact: true
    },
    {
      title: t('nav.clients'),
      href: `/dashboard/clients`,
      icon: <Users className="mr-2 h-4 w-4" />
    },
    {
      title: t('nav.billing'),
      href: `/dashboard/billing`,
      icon: <CreditCard className="mr-2 h-4 w-4" />
    },
    {
      title: t('nav.documents'),
      href: `/dashboard/documents`,
      icon: <FileText className="mr-2 h-4 w-4" />
    },
    {
      title: t('nav.calendar'),
      href: `/dashboard/calendar`,
      icon: <CalendarDays className="mr-2 h-4 w-4" />
    },
    {
      title: t('nav.messages'),
      href: `/dashboard/messages`,
      icon: <MessageSquare className="mr-2 h-4 w-4" />
    },
    {
      title: t('nav.store'),
      href: `/dashboard/store`,
      icon: <Store className="mr-2 h-4 w-4" />
    },
    {
      title: t('nav.settings'),
      href: `/dashboard/settings`,
      icon: <Settings className="mr-2 h-4 w-4" />
    }
  ];

  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item, index) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={index}
            href={item.href}
            className={cn(
              'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'transparent hover:bg-accent hover:text-accent-foreground'
            )}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
