'use client';

import * as React from 'react';
import {
  AudioWaveform,
  Receipt,
  FileText,
  CreditCard,
  Users,
  Settings,
  Building2,
  ScrollText,
  Calculator,
  LayoutDashboard,
  BookOpen,
  Building,
  FilePlus,
  Home,
  RefreshCw,
  TrendingUp,
  Store,
  Command,
  GalleryVerticalEnd
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { Company } from '@/components/company/select/types';
import ActionButton from './action-button';
import { NavMain } from './nav-main';
import { NavProjects } from './nav-projects';
import { NavUser } from './nav-user';
import { TeamSwitcher } from './team-switcher';
import LocaleSwitcher from '../lang/LocaleSwitcher';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
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
          url: '/creditmemos'
        },
        {
          title: 'Sales Receipts',
          url: '/salesreceipts'
        },
        {
          title: 'Delayed Charges',
          url: '/delayedcharges'
        },
        {
          title: 'Delayed Credits',
          url: '/delayedcredits'
        },
        {
          title: 'Refund Receipts',
          url: '/refundreceipts'
        }
      ]
    },

    {
      title: 'Categories',
      url: '/finance/categories',
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
