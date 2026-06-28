'use client';

import * as React from 'react';
import {
  Settings,
  Building2,
  Calculator,
  LayoutDashboard,
  BookOpen,
  FilePlus,
  Home,
  TrendingUp,
  Store} from 'lucide-react';

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

const buildNavData = (companySlug: string) => ({
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  navMain: [
    {
      title: 'Dashboard',
      url: `/${companySlug}`,
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
      url: '#',
      icon: Calculator,
      items: [
        {
          title: 'Account Plan',
          url: `/${companySlug}/account-plan`
        },
        {
          title: 'Journals',
          url: `/${companySlug}/journals`
        }
      ]
    },
    {
      title: 'Finance Dashboards',
      url: '#',
      icon: LayoutDashboard,
      items: [
        {
          title: 'Invoices',
          url: `/${companySlug}/invoice`
        },
        {
          title: 'Payments',
          url: `/${companySlug}/payment`
        },
        {
          title: 'Customers',
          url: `/${companySlug}/customers`
        },
        {
          title: 'Estimates',
          url: `/${companySlug}/estimate`
        },
        {
          title: 'Credit Memos',
          url: `/${companySlug}/credit-memo`
        },
        {
          title: 'Sales Receipts',
          url: `/${companySlug}/sales-receipt`
        },
        {
          title: 'Delayed Charges',
          url: `/${companySlug}/delayed-charge`
        },
        {
          title: 'Delayed Credits',
          url: `/${companySlug}/delayed-credit`
        },
        {
          title: 'Refund Receipts',
          url: `/${companySlug}/refund-receipt`
        }
      ]
    },
    {
      title: 'Categories',
      url: `/${companySlug}/category`,
      icon: BookOpen
    },
    {
      title: 'Finance Settings',
      url: '#',
      icon: Settings,
      items: [
        {
          title: 'Company Settings',
          url: `/${companySlug}/edit-company`
        },
        {
          title: 'Tax Settings',
          url: `/${companySlug}/tax`
        },
        {
          title: 'Category Settings',
          url: `/${companySlug}/category`
        }
      ]
    }
  ],
  projects: [
    {
      name: 'Quick Actions',
      url: '#',
      icon: FilePlus
    },
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
  ]
});

export function AppSidebar({
  companies = [],
  companySlug = '',
  activeCompanyId = '',
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  companies?: Company[];
  companySlug?: string;
  activeCompanyId?: string;
}) {
  const { open } = useSidebar();
  const data = buildNavData(companySlug);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher companies={companies} activeCompanyId={activeCompanyId} />
      </SidebarHeader>
      <SidebarContent className="px-2 group-data-[collapsible=icon]:px-0">
        <div className="mb-4">
          <ActionButton isOpen={open} />
        </div>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      {/* <SidebarRail /> */}
    </Sidebar>
  );
}
