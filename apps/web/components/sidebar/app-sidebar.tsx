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
import { NavUser } from './nav-user';
import { TeamSwitcher } from './team-switcher';

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
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  companies?: Company[];
  companySystemRole?: string | null;
}) {
  const { open } = useSidebar();
  const params = useParams();
  const companySlug = params['company-slug'] as string | undefined;

  const isAccountantRole = companySystemRole !== null && ACCOUNTANT_SYSTEM_ROLES.includes(companySystemRole);

  const accountantPortalItem = companySlug && isAccountantRole
    ? [
        {
          title: 'Accountant Portal',
          url: `/${companySlug}/accountant-dashboard`,
          icon: GraduationCap,
          isActive: true
        }
      ]
    : [];

  const navItems = isAccountantRole ? accountantPortalItem : baseNavItems;

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
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
