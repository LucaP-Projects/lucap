'use client';

import { Check, FolderIcon, Wallet } from 'lucide-react';
import { CommandItem } from '@silknexus/ui';
import { cn } from '@/lib/utils';
import { AccountSelectData } from './actions';

interface AccountItemProps {
  account: AccountSelectData;
  level: number;
  selectedAccountId?: string;
  onSelect: (account: AccountSelectData) => void;
}

export function AccountItem({
  account,
  level,
  selectedAccountId,
  onSelect
}: AccountItemProps) {
  const paddingLeft = level * 12;
  const isTemplateAccount = !account.is_custom;

  return (
    <>
      <CommandItem
        value={`${account.title} ${account.number}`}
        onSelect={() => onSelect(account)}
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 text-sm',
          'hover:bg-accent/50',
          selectedAccountId === account.id && 'bg-accent'
        )}
        style={{ paddingLeft: `${paddingLeft + 8}px` }}
      >
        {isTemplateAccount ? (
          <FolderIcon className="h-4 w-4 shrink-0 opacity-70" />
        ) : (
          <Wallet className="h-4 w-4 shrink-0 opacity-70" />
        )}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex-1 truncate">{account.title}</span>
          <span className="text-muted-foreground shrink-0">
            {account.number}
          </span>
        </div>
        {selectedAccountId === account.id && (
          <Check className="h-4 w-4 shrink-0" />
        )}
      </CommandItem>
      {account.subAccounts?.map((sub) => (
        <AccountItem
          key={sub.id}
          account={sub}
          level={level + 1}
          selectedAccountId={selectedAccountId}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}
