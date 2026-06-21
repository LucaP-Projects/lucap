'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStore } from '@/hooks/use-store';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/stores/useSidebar';
import { selectCompany } from './actions';
import { Company } from './types';
import { toast } from 'sonner';

interface NavCompanySelectorProps {
  companies: Company[];
}

export default function NavCompanySelector({
  companies
}: NavCompanySelectorProps) {
  const [isPending, startTransition] = useTransition();
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const router = useRouter();
  const { data: session, refetch: updateSession } = authClient.useSession();
  const currentCompanyId = session?.user?.companyId || '';
  const sidebar = useStore(useSidebar, (x) => x);
  console.log(session);
  useEffect(() => {
    if (session?.user && !session.user.companyId && companies?.length > 0) {
      handleSelectCompany(companies?.[0]?.id);
    }
  }, [session?.user, companies]);

  if (!sidebar) return null;

  const { getOpenState, setSettings } = sidebar;
  const isOpen = getOpenState();

  const handleSelectCompany = async (companyId: string) => {
    if (!companyId || companyId === currentCompanyId || isPending) return;

    startTransition(async () => {
      try {
        const result = await selectCompany(companyId);
        if (!result) throw new Error('Failed to select company');
        await updateSession();
        window.location.reload();
        router.refresh();
        toast('Company selected successfully');
      } catch (error) {
        console.error('Selection error:', error);
        toast(
          error instanceof Error ? error.message : 'Failed to select company'
        );
      }
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsSelectOpen(open);
    setSettings({ isHoverOpen: !open });
  };

  if (!companies || companies.length === 0) {
    return (
      <Link
        href={`/create-organization`}
        className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm"
      >
        <PlusCircle className="h-4 w-4" />
        {isOpen && 'Create First Company'}
      </Link>
    );
  }

  const selectedCompany = companies.find(
    (company) => company.id === currentCompanyId
  );

  return (
    <Select
      value={currentCompanyId || undefined}
      onValueChange={handleSelectCompany}
      open={isSelectOpen}
      onOpenChange={handleOpenChange}
    >
      <SelectTrigger
        className={cn(
          'bg-secondary/50 h-10 transition-all duration-200',
          isOpen ? 'flex w-full text-center' : 'w-full max-w-[64px]'
        )}
        disabled={isPending}
      >
        <SelectValue placeholder="Select company">
          {selectedCompany ? (
            <div className="flex items-center gap-2 overflow-hidden">
              {selectedCompany.logo ? (
                <img
                  src={selectedCompany.logo}
                  alt={selectedCompany.name}
                  className="bg-background h-6 w-6 shrink-0 rounded-full p-0.5"
                />
              ) : (
                <div className="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-medium">
                  {selectedCompany.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div
                className={cn(
                  'flex flex-col transition-all duration-200',
                  isOpen
                    ? 'translate-x-0 opacity-100'
                    : '-translate-x-4 opacity-0'
                )}
              >
                <span className="font-medium leading-none">
                  {selectedCompany.name}
                </span>
                {selectedCompany.isAdmin && (
                  <span className="text-muted-foreground text-xs leading-tight">
                    Administrator
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span
              className={cn('flex items-center gap-2', !isOpen && 'opacity-0')}
            >
              <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">
                <PlusCircle className="h-4 w-4" />
              </div>
              Select company
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        key={currentCompanyId}
        className="min-w-[180px]"
        style={{ zIndex: 1000 }}
        position="popper"
        sideOffset={5}
        align="center"
      >
        {companies.map((company) => (
          <SelectItem key={company.id} value={company.id} disabled={isPending}>
            <div className="flex items-center gap-2">
              {company.logo && (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-4 w-4 rounded-full"
                />
              )}
              <span>{company.name}</span>
              {company.isAdmin && (
                <span className="text-muted-foreground text-xs">(Admin)</span>
              )}
            </div>
          </SelectItem>
        ))}
        <div className="border-t p-2">
          <Link
            href={`/create-organization`}
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Create New Company
          </Link>
        </div>
      </SelectContent>
    </Select>
  );
}
