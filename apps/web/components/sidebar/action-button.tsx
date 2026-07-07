'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Plus,
  Calculator,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Package,
  Receipt,
  Users,
  Zap,
  Scan,
  Image as ImageIcon,
  LucideIcon
} from 'lucide-react';
import { DocumentScannerModal } from '@/components/shared/document-scanner';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

type ActionItem = {
  route: string;
  icon: LucideIcon;
  category: string;
};

type ActionRoutes = {
  [key: string]: ActionItem;
};

const actionRoutes: ActionRoutes = {
  // Scanner routes
  'Scan Document': {
    route: 'SCANNER',
    icon: Scan,
    category: 'Workflows'
  },
  'Upload Document': {
    route: 'GALLERY',
    icon: ImageIcon,
    category: 'Workflows'
  },
  'Ask LucaP Assistant': {
    route: '/assistant',
    icon: Zap,
    category: 'Workflows'
  },

  // Customer routes - matching your actual file structure
  Invoices: { route: '/invoices', icon: FileText, category: 'Customers' },
  'Add Invoice': { route: '/invoices/new', icon: FileText, category: 'Customers' },
  'Receive payment': {
    route: '/receive-payment',
    icon: DollarSign,
    category: 'Customers'
  },
  Statements: { route: '/statements', icon: FileText, category: 'Customers' },
  Estimates: { route: '/estimates', icon: Calculator, category: 'Customers' },
  'Add Estimate': { route: '/estimates/new', icon: Calculator, category: 'Customers' },
  'Sales orders': {
    route: '/sales-orders',
    icon: Package,
    category: 'Customers'
  },
  'Credit memo': {
    route: '/credit-memo',
    icon: Receipt,
    category: 'Customers'
  },
  'Sales receipt': {
    route: '/sales-receipt/new',
    icon: Receipt,
    category: 'Customers'
  },
  'Shipping label': {
    route: '/shipping-labels',
    icon: Package,
    category: 'Customers'
  },
  'Refund receipt': {
    route: '/refund-receipt/new',
    icon: Receipt,
    category: 'Customers'
  },
  'Delayed credit': {
    route: '/delayed-credits',
    icon: Clock,
    category: 'Customers'
  },
  'Delayed charge': {
    route: '/delayed-charges/new',
    icon: Clock,
    category: 'Customers'
  },
  'Add customer': {
    route: '/customers/new',
    icon: Users,
    category: 'Customers'
  },

  // Vendor routes
  Expense: {
    route: '/vendors/expenses/new',
    icon: CreditCard,
    category: 'Vendors'
  },
  Check: { route: '/vendors/checks/new', icon: FileText, category: 'Vendors' },
  Bill: { route: '/vendors/bills/new', icon: FileText, category: 'Vendors' },
  'Pay bills': {
    route: '/vendors/pay-bills',
    icon: DollarSign,
    category: 'Vendors'
  },
  'Purchase order': {
    route: '/vendors/purchase-orders/new',
    icon: Package,
    category: 'Vendors'
  },
  'Vendor credit': {
    route: '/vendors/credits/new',
    icon: Receipt,
    category: 'Vendors'
  },
  'Credit card credit': {
    route: '/vendors/credit-card-credits/new',
    icon: CreditCard,
    category: 'Vendors'
  },
  'Print checks': {
    route: '/vendors/print-checks',
    icon: FileText,
    category: 'Vendors'
  },
  'Add vendor': { route: '/vendors/new', icon: Users, category: 'Vendors' },

  // Team routes
  Payroll: { route: '/team/payroll/new', icon: DollarSign, category: 'Team' },
  'Single time activity': {
    route: '/team/time-activities/new',
    icon: Clock,
    category: 'Team'
  },
  'Weekly timesheet': {
    route: '/team/timesheets/new',
    icon: Calendar,
    category: 'Team'
  },
  'Add employee': {
    route: '/team/employees/new',
    icon: Users,
    category: 'Team'
  },
  'Add contractor': {
    route: '/team/contractors/new',
    icon: Users,
    category: 'Team'
  },

  // Other routes
  Task: { route: '/tasks/new', icon: Zap, category: 'Other' },
  'Bank deposit': {
    route: '/banking/deposits/new',
    icon: DollarSign,
    category: 'Other'
  },
  Transfer: {
    route: '/banking/transfers/new',
    icon: DollarSign,
    category: 'Other'
  },
  'Journal entry': { route: '/journal', icon: FileText, category: 'Other' },
  'Inventory qty adjustment': {
    route: '/inventory/adjustments/new',
    icon: Package,
    category: 'Other'
  },
  'Batch transactions': {
    route: '/transactions/batch/new',
    icon: FileText,
    category: 'Other'
  },
  'Pay down credit card': {
    route: '/banking/credit-cards/payment',
    icon: CreditCard,
    category: 'Other'
  },
  'Add product/service': {
    route: '/items',
    icon: Package,
    category: 'Other'
  },

  // Project routes
  Project: { route: '/projects/new', icon: Zap, category: 'Projects' },
  'Project estimate': {
    route: '/projects/estimates/new',
    icon: Calculator,
    category: 'Projects'
  }
};

export default function ActionButton({ isOpen }: { isOpen?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isGallery, setIsGallery] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleItemClick = async (item: string) => {
    const actionItem = actionRoutes[item];
    if (actionItem) {
      setOpen(false);
      if (actionItem.route === 'SCANNER') {
        setIsGallery(false);
        setIsScannerOpen(true);
      } else if (actionItem.route === 'GALLERY') {
        setIsGallery(true);
        setIsScannerOpen(true);
      } else {
        router.push(actionItem.route);
      }
    } else {
      console.log(`No route defined for: ${item}`);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (
      !newOpen &&
      (pathname?.includes('/new') || pathname?.includes('/create'))
    ) {
      const parentPath = pathname.split('/').slice(0, -1).join('/');
      router.push(parentPath);
    }
    setOpen(newOpen);
  };

  // Group actions by category
  const groupedActions = Object.entries(actionRoutes).reduce(
    (acc, [name, item]) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      (acc[item.category] as Array<{ name: string } & ActionItem>).push({ name, ...item });
      return acc;
    },
    {} as Record<string, Array<{ name: string } & ActionItem>>
  );

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          'bg-accent hover:bg-accent/80 hover:text-accent-foreground group h-10 w-full transition-all duration-200',
          isOpen === false ? 'justify-center px-3' : 'justify-between px-4'
        )}
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-3">
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          <span
            className={cn(
              'font-medium transition-all duration-200',
              isOpen === false ? 'sr-only' : 'opacity-100'
            )}
          >
            New
          </span>
        </div>

        {isOpen !== false && (
          <div className=" flex items-center gap-1 text-xs">
            <kbd className=" pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono font-medium ">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        )}
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Create New"
        description="Search for an action to create new items..."
      >
        <Command>
          <CommandInput placeholder="Search actions..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {Object.entries(groupedActions).map(([category, items]) => (
              <CommandGroup key={category} heading={category}>
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.name}
                      value={item.name}
                      onSelect={() => handleItemClick(item.name)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{item.name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
      <DocumentScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        startWithGallery={isGallery}
      />
    </>
  );
}
