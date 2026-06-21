'use client';

import * as React from 'react';
import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronsUpDown, Plus, Building2 } from 'lucide-react';

import { selectCompany } from '@/components/company/select/actions';
import { Company } from '@/components/company/select/types';
import {
    DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { authClient } from '@/lib/auth-client';

export function TeamSwitcher({ companies }: { companies: Company[] }) {
  const { isMobile, open: isOpen } = useSidebar();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { data: session, refetch: updateSession } = authClient.useSession();

  const currentCompanyId = session?.user?.companyId || '';
  const selectedCompany = companies.find(
    (company) => company.id === currentCompanyId
  );

  React.useEffect(() => {
    if (session?.user && !session.user.companyId && companies?.length > 0) {
      handleSelectCompany(companies[0].id);
    }
  }, [session?.user, companies]);

  const handleSelectCompany = async (companyId: string) => {
    if (!companyId || companyId === currentCompanyId || isPending) return;

    startTransition(async () => {
      try {
        const result = await selectCompany(companyId);
        if (!result) throw new Error('Failed to select company');
        await updateSession();
        window.location.reload();
        router.refresh();
        toast.success('Company selected successfully');
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to select company'
        );
      }
    });
  };

  if (!companies || companies.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <TooltipProvider disableHoverableContent>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="group-data-[collapsible=icon]:justify-center!"
                  asChild
                >
                  <Link href={`/create-company`}>
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                      <Plus className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold">
                        Create Company
                      </span>
                      <span className="truncate text-xs">Get started</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </TooltipTrigger>
              {!isOpen && (
                <TooltipContent side="right">
                  Create First Company
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!selectedCompany) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <TooltipProvider disableHoverableContent>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/80 transition-colors group-data-[collapsible=icon]:justify-center!"
                    disabled={isPending}
                  >
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                      {selectedCompany.logo ? (
                        <img
                          src={selectedCompany.logo}
                          alt={selectedCompany.name}
                          className="size-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center">
                          {selectedCompany.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold">
                        {selectedCompany.name}
                      </span>
                      <span className="truncate text-xs">
                        {selectedCompany.isAdmin
                          ? 'Administrator'
                          : selectedCompany.companyRole}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  align="start"
                  side={isMobile ? 'bottom' : 'right'}
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="text-muted-foreground text-xs">
                    Companies
                  </DropdownMenuLabel>
                  {companies.map((company, index) => {
                    const isSelected = company.id === currentCompanyId;
                    return (
                      <DropdownMenuItem
                        key={company.id}
                        onClick={() => handleSelectCompany(company.id)}
                        className={`gap-2 p-2 transition-colors ${
                          isSelected
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'hover:bg-accent/50'
                        }`}
                        disabled={isPending}
                      >
                        <div
                          className={`flex size-6 items-center justify-center rounded-sm border ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-border'
                          }`}
                        >
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt={company.name}
                              className="size-4 rounded-full object-cover"
                            />
                          ) : (
                            <Building2
                              className={`size-4 shrink-0 ${
                                isSelected ? 'text-primary' : ''
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col">
                          <span
                            className={`font-medium ${
                              isSelected ? 'text-primary' : ''
                            }`}
                          >
                            {company.name}
                            {isSelected && (
                              <span className="text-primary ml-1 text-xs">
                                ✓
                              </span>
                            )}
                          </span>
                          {company.isAdmin && (
                            <span
                              className={`text-xs ${
                                isSelected
                                  ? 'text-primary/70'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              (Admin)
                            </span>
                          )}
                        </div>
                        {/* <DropdownMenuShortcut>
                          ⌘{index + 1}
                        </DropdownMenuShortcut> */}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 p-2" asChild>
                    <Link href={`/create-company`}>
                      <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                        <Plus className="size-4" />
                      </div>
                      <div className="text-muted-foreground font-medium">
                        Add company
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            {!isOpen && (
              <TooltipContent side="right">Company Select</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
