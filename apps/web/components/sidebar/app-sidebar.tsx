'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import {
  Settings,
  Building2,
  Calculator,
  LayoutDashboard,
  BookOpen,
  Home,
  TrendingUp,
  Store,
  GraduationCap
} from 'lucide-react';

import { Company } from '@/components/company/select/types';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar
} from '@/components/ui/sidebar';
import ActionButton from './action-button';
import { NavMain } from './nav-main';
import { NavProjects } from './nav-projects';
import { NavUser, ServerUser } from './nav-user';
import { TeamSwitcher } from './team-switcher';

export type UnverifiedCounts = {
  invoices: number;
  payments: number;
  customers: number;
  estimates: number;
  creditMemos: number;
  salesReceipts: number;
  delayedCharges: number;
  delayedCredits: number;
  refundReceipts: number;
};

const baseNavItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
    isActive: true
  },
  {
    title: 'Company Management',
    url: '#',
    icon: Building2,
    items: [
      {
        title: 'Create Company',
        url: '/create-company'
      },
      {
        title: 'Select Company',
        url: '/select-company'
      }
    ]
  },
  {
    title: 'Accountant',
    url: '/',
    icon: Calculator,
    items: [
      {
        title: 'Account Plan',
        url: '/account-plan'
      },
      {
        title: 'Journals',
        url: '/journals'
      }
    ]
  },
  {
    title: 'Finance Dashboards',
    url: '/finance/dashboards',
    icon: LayoutDashboard,
    items: [
      {
        title: 'Invoices',
        url: '/invoices'
      },
      {
        title: 'Payments',
        url: '/payments'
      },
      {
        title: 'Customers',
        url: '/customers'
      },
      {
        title: 'Estimates',
        url: '/estimates'
      },
      {
        title: 'Credit Memos',
        url: '/credit-memos'
      },
      {
        title: 'Sales Receipts',
        url: '/sales-receipts'
      },
      {
        title: 'Delayed Charges',
        url: '/delayed-charges'
      },
      {
        title: 'Delayed Credits',
        url: '/delayed-credits'
      },
      {
        title: 'Refund Receipts',
        url: '/refund-receipts'
      }
    ]
  },
  {
    title: 'Categories',
    url: '/categories',
    icon: BookOpen
  },
  {
    title: 'Finance Settings',
    url: '/finance/settings',
    icon: Settings,
    items: [
      {
        title: 'Company Settings',
        url: '/settings/edit-company'
      },
      {
        title: 'Tax Settings',
        url: '/settings/tax'
      },
      {
        title: 'Category Settings',
        url: '/settings/category'
      }
    ]
  }
];

const projects = [
  {
    name: 'Reports & Analytics',
    url: '/reports',
    icon: TrendingUp
  },
  {
    name: 'Store Management',
    url: '/store',
    icon: Store
  }
];

const ACCOUNTANT_SYSTEM_ROLES = ['SUPER_ACCOUNTANT', 'ACCOUNTANT_STAFF'];

export function AppSidebar({
  companies = [],
  companySystemRole = null,
  unverifiedCounts,
  serverUser,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  companies?: Company[];
  companySystemRole?: string | null;
  unverifiedCounts?: UnverifiedCounts;
  serverUser?: ServerUser;
}) {
  const { open } = useSidebar();
  const params = useParams();
  const companySlug = params['company-slug'] as string | undefined;

  const isAccountantRole =
    companySystemRole !== null &&
    ACCOUNTANT_SYSTEM_ROLES.includes(companySystemRole);

  const accountantPortalItem =
    companySlug && isAccountantRole
      ? [
          {
            title: 'Accountant Portal',
            url: `/${companySlug}/accountant-dashboard`,
            icon: GraduationCap,
            isActive: true
          }
        ]
      : [];

  const accountantFinanceDashboards =
    companySlug && isAccountantRole
      ? [
          {
            title: 'Finance Dashboards',
            url: '#',
            icon: LayoutDashboard,
            items: [
              {
                title: 'Invoices',
                url: `/${companySlug}/accountant-review/invoices`,
                badge: unverifiedCounts?.invoices ?? 0
              },
              {
                title: 'Payments',
                url: `/${companySlug}/accountant-review/payments`,
                badge: unverifiedCounts?.payments ?? 0
              },
              {
                title: 'Customers',
                url: `/${companySlug}/accountant-review/customers`,
                badge: unverifiedCounts?.customers ?? 0
              },
              {
                title: 'Estimates',
                url: `/${companySlug}/accountant-review/estimates`,
                badge: unverifiedCounts?.estimates ?? 0
              },
              {
                title: 'Credit Memos',
                url: `/${companySlug}/accountant-review/credit-memos`,
                badge: unverifiedCounts?.creditMemos ?? 0
              },
              {
                title: 'Sales Receipts',
                url: `/${companySlug}/accountant-review/sales-receipts`,
                badge: unverifiedCounts?.salesReceipts ?? 0
              },
              {
                title: 'Delayed Charges',
                url: `/${companySlug}/accountant-review/delayed-charges`,
                badge: unverifiedCounts?.delayedCharges ?? 0
              },
              {
                title: 'Delayed Credits',
                url: `/${companySlug}/accountant-review/delayed-credits`,
                badge: unverifiedCounts?.delayedCredits ?? 0
              },
              {
                title: 'Refund Receipts',
                url: `/${companySlug}/accountant-review/refund-receipts`,
                badge: unverifiedCounts?.refundReceipts ?? 0
              }
            ]
          }
        ]
      : [];

  const navItems = isAccountantRole
    ? [...accountantPortalItem, ...accountantFinanceDashboards]
    : baseNavItems;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher companies={companies} />
      </SidebarHeader>
      <SidebarContent className="px-2 group-data-[collapsible=icon]:px-0">
        <div className="mb-4">
          <ActionButton isOpen={open} />
        </div>
        <NavMain items={navItems} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser serverUser={serverUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
