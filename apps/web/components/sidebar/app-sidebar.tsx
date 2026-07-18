'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import {
  Banknote,
  BookOpen,
  Box,
  Building2,
  Calculator,
  GraduationCap,
  HardDrive,
  Home,
  LayoutDashboard,
  LucideIcon,
  MessageSquare,
  PieChart,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Ticket,
  UserMinus,
  Users
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
import { useAssistantStore } from '@/stores/useAssistantStore';

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

interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

const COMPANY_NAV_BASE: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
    isActive: true
  },
  {
    title: 'Assistant',
    url: '/assistant',
    icon: MessageSquare
  },
  {
    title: 'Drive',
    url: '/drive',
    icon: HardDrive
  },
  {
    title: 'Marketplace',
    url: '/marketplace',
    icon: Store,
    items: [
      {
        title: 'Browse Stores',
        url: '/marketplace'
      },
      {
        title: 'My Cart',
        url: '/cart'
      },
      {
        title: 'My Orders',
        url: '/orders'
      }
    ]
  },
  {
    title: 'My Store',
    url: '/store',
    icon: ShoppingBag,
    items: [
      {
        title: 'Store Dashboard',
        url: '/store'
      },
      {
        title: 'Products',
        url: '/store/products'
      },
      {
        title: 'Orders',
        url: '/store/orders'
      },
      {
        title: 'Store Settings',
        url: '/settings/store'
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
        url: '/sales-receipt'
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
        url: '/refund-receipt'
      }
    ]
  },
  {
    title: 'Categories',
    url: '/categories',
    icon: BookOpen
  },
  {
    title: 'Team & Roles',
    url: '/settings/team',
    icon: Users
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

const ACCOUNTANT_NAV_BASE: NavItem[] = [
  {
    title: 'Accountant Dashboard',
    url: '/accountant-dashboard',
    icon: GraduationCap,
  },
  {
    title: 'Tickets Triage',
    url: '/accountant-dashboard/tickets',
    icon: MessageSquare
  },
  {
    title: 'Client Management',
    url: '/accountant-dashboard/clients',
    icon: Users,
    items: [
      {
        title: 'Setup Monitor',
        url: '/accountant-dashboard/setup'
      },
      {
        title: 'Client Documents',
        url: '/accountant-dashboard/documents'
      }
    ]
  },
  {
    title: 'Accountant Tools',
    icon: Calculator,
    url: '#',
    items: [
      {
        title: 'Global Account Plan',
        url: '/accountant-dashboard/account-plan'
      },
      {
        title: 'Multi-Batch Journals',
        url: '/accountant-dashboard/journals'
      }
    ]
  }
];

const ADMIN_NAV_BASE: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard
  },
  {
    title: 'Companies',
    url: '/admin/companies',
    icon: Building2
  },
  {
    title: 'Users',
    url: '/admin/users',
    icon: Users
  },
  {
    title: 'Accountants',
    url: '/admin/accountants',
    icon: ShieldCheck
  },
  {
    title: 'Exchange Rates',
    url: '/admin/exchange-rates',
    icon: Banknote
  }
];

const REPORTS_NAV_BASE: NavItem[] = [
  {
    title: 'Business Overview',
    url: '/reports/overview',
    icon: PieChart,
    items: [
      { title: 'Audit Log', url: '/reports/audit-log' },
      { title: 'Balance Sheet', url: '/reports/balance-sheet' },
      { title: 'Balance Sheet Comparison', url: '/reports/balance-sheet-comparison' },
      { title: 'Balance Sheet Detail', url: '/reports/balance-sheet-detail' },
      { title: 'Balance Sheet Summary', url: '/reports/balance-sheet-summary' },
      { title: 'Statement of Cash Flows', url: '/reports/cash-flow' },
      { title: 'Business Snapshot', url: '/reports/snapshot' },
      { title: 'Profit and Loss', url: '/reports/profit-loss' },
      { title: 'Profit and Loss by Customer', url: '/reports/profit-loss-customer' },
      { title: 'Profit and Loss by Month', url: '/reports/profit-loss-month' },
      { title: 'Profit and Loss by Tag Group', url: '/reports/profit-loss-tag' },
      { title: 'Profit and Loss Comparison', url: '/reports/profit-loss-comparison' },
      { title: 'Profit and Loss Detail', url: '/reports/profit-loss-detail' },
      { title: 'Profit and Loss % of total income', url: '/reports/profit-loss-percent' },
      { title: 'Profit and Loss YTD comparison', url: '/reports/profit-loss-ytd' },
      { title: 'Project Profitability Summary', url: '/reports/project-profitability' },
      { title: 'Quarterly Profit and Loss Summary', url: '/reports/quarterly-profit-loss' },
    ]
  },
  {
    title: 'Who Owes You',
    url: '/reports/receivables',
    icon: UserMinus,
    items: [
      { title: 'AR aging summary', url: '/reports/ar-aging-summary' },
      { title: 'AR aging detail', url: '/reports/ar-aging-detail' },
      { title: 'Collections Report', url: '/reports/collections' },
      { title: 'Customer Balance Summary', url: '/reports/customer-balance-summary' },
      { title: 'Customer Balance Detail', url: '/reports/customer-balance-detail' },
      { title: 'Invoice List', url: '/reports/invoices' },
      { title: 'Invoices and Received Payments', url: '/reports/invoices-payments' },
      { title: 'Open Invoices', url: '/reports/open-invoices' },
      { title: 'Statement List', url: '/reports/statements' },
      { title: 'Terms List', url: '/reports/terms' },
      { title: 'Unbilled charges', url: '/reports/unbilled-charges' },
      { title: 'Unbilled time', url: '/reports/unbilled-time' },
    ]
  },
  {
    title: 'Sales and customers',
    url: '/reports/sales',
    icon: ShoppingBag,
    items: [
      { title: 'Sales by Customer Type Detail', url: '/reports/sales-customer-type' },
      { title: 'Estimates & Progress Invoicing', url: '/reports/estimates-progress' },
      { title: 'Customer Contact List', url: '/reports/customer-contacts' },
      { title: 'Income by Customer Summary', url: '/reports/income-customer-summary' },
      { title: 'Customer Phone List', url: '/reports/customer-phones' },
      { title: 'Sales by Customer Summary', url: '/reports/sales-customer-summary' },
      { title: 'Sales by Customer Detail', url: '/reports/sales-customer-detail' },
      { title: 'Deposit Detail', url: '/reports/deposits' },
      { title: 'Estimates by Customer', url: '/reports/estimates-customer' },
      { title: 'Product/Service List', url: '/reports/product-service-list' },
      { title: 'Sales by Product/Service Summary', url: '/reports/sales-product-summary' },
      { title: 'Sales by Product/Service Detail', url: '/reports/sales-product-detail' },
      { title: 'Payment Method List', url: '/reports/payment-methods' },
      { title: 'Time Activities by Customer Detail', url: '/reports/time-activities-customer' },
      { title: 'Transaction List by Customer', url: '/reports/transactions-customer' },
      { title: 'Transaction List by Tag Group', url: '/reports/transactions-tag' },
    ]
  },
  {
    title: 'Inventory',
    url: '/reports/inventory',
    icon: Box,
    items: [
      { title: 'Inventory Valuation Detail', url: '/reports/inventory-valuation-detail' },
      { title: 'Inventory Valuation Summary', url: '/reports/inventory-valuation-summary' },
      { title: 'Open Purchase Order Detail', url: '/reports/open-po-detail' },
      { title: 'Open Purchase Order List', url: '/reports/open-po-list' },
      { title: 'Physical Inventory Worksheet', url: '/reports/inventory-worksheet' },
    ]
  }
];

const projects = [
  {
    title: 'Store Management',
    url: '/store',
    icon: Store
  }
];

export function AppSidebar({
  companies = [],
  companySystemRole: _role,
  activeCompanyId,
  portalMode = 'company',
  unverifiedCounts,
  serverUser,
  isAccountant = false,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  companies?: Company[];
  companySystemRole?: string | null;
  activeCompanyId?: string | null;
  portalMode?: 'company' | 'accountant' | 'admin';
  unverifiedCounts?: UnverifiedCounts;
  serverUser?: ServerUser;
  isAccountant?: boolean;
}) {
  const { open } = useSidebar();
  const { toggleAssistant } = useAssistantStore();
  const params = useParams();
  const companySlug = params['company-slug'] as string | undefined;

  // Accountant-firm membership (AccountantUser), not a company-scoped role —
  // a company's own Moderator/Staff role can no longer double as "accountant".
  const hasAccountantAccess = isAccountant;

  // Helper to prefix URL with company slug when appropriate
  const prefixUrl = (url: string) => {
    if (!companySlug || portalMode === 'accountant' || portalMode === 'admin') return url;
    if (url === '#') return '#';
    if (url.startsWith('http')) return url;
    return `/${companySlug}${url === '/' ? '' : url}`;
  };

  const getPrefixedNavItems = (items: NavItem[]): NavItem[] => items.map(item => ({
      ...item,
      url: prefixUrl(item.url),
      items: item.items?.map(subItem => ({
        ...subItem,
        url: prefixUrl(subItem.url)
      }))
    }));

  const userNavItems = [
    ...getPrefixedNavItems(COMPANY_NAV_BASE),
    {
      title: 'Support',
      icon: Ticket,
      url: '#',
      items: [
        {
          title: 'My Tickets',
          url: prefixUrl('/tickets')
        }
      ]
    }
  ];

  const accountantPortalItems = getPrefixedNavItems(ACCOUNTANT_NAV_BASE);
  const adminPortalItems = getPrefixedNavItems(ADMIN_NAV_BASE);
  const reportNavItems = getPrefixedNavItems(REPORTS_NAV_BASE);

  // Separate sidebars: show only what's relevant to the current variant
  const navItems: NavItem[] =
    portalMode === 'accountant'
      ? [...accountantPortalItems]
      : portalMode === 'admin'
        ? [...adminPortalItems]
        : [...userNavItems];

  if (portalMode === 'accountant') {
    if (companies.length > 0) {
        navItems.push({
            title: 'Back to Company View',
            url: '/',
            icon: Home
        });
    }
  } else if (portalMode === 'company') {
    if (hasAccountantAccess) {
      navItems.push({
        title: 'Accountant Portal',
        url: '/accountant-dashboard',
        icon: GraduationCap
      });
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher companies={companies} activeCompanyId={activeCompanyId} />
      </SidebarHeader>
      <SidebarContent className="px-2 group-data-[collapsible=icon]:px-0">
        <div className="mb-4">
          <ActionButton isOpen={open} />
        </div>
        <NavMain 
          items={navItems} 
          onItemClick={(item) => {
            if (item.title === 'Assistant') {
              toggleAssistant();
            }
          }}
        />
        {portalMode === 'company' && (
          <NavMain items={reportNavItems} label="Reports" />
        )}
        <NavProjects projects={portalMode === 'company' ? projects : []} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser serverUser={serverUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
