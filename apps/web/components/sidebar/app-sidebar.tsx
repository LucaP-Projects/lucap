'use client';

import * as React from 'react';
import {
  Settings,
  Building2,
  Calculator,
  LayoutDashboard,
  BookOpen,
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

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  navMain: [
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
  ],
  projects: [
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
};

export function AppSidebar({
  companies = [],
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  companies?: Company[];
}) {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher companies={companies} />
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
