import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsUpDown } from 'lucide-react';
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@silknexus/ui';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

import { AccountForm } from '../../accounts/form';
import { AccountItem } from './account-item';
import { AccountSelectData, getAccountsForSelect } from './actions';

interface AccountSelectProps {
  showCreate?: boolean;
  onSelect: (account: AccountSelectData) => void;
  selectedAccountId?: string;
  className?: string;
}

const AccountSelect = React.forwardRef<HTMLButtonElement, AccountSelectProps>(
  ({ onSelect, selectedAccountId, className, showCreate = true }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [sheetOpen, setSheetOpen] = React.useState(false);
    const [accounts, setAccounts] = React.useState<AccountSelectData[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const router = useRouter();

    const debouncedSearch = useDebounce(search, 300);

    // Function to find an account in the nested structure
    const findAccount = React.useCallback(
      (
        accounts: AccountSelectData[],
        id: string
      ): AccountSelectData | undefined => {
        for (const account of accounts) {
          if (account.id === id) return account;
          if (account.subAccounts?.length) {
            const found = findAccount(account.subAccounts, id);
            if (found) return found;
          }
        }
        return undefined;
      },
      []
    );
    const fetchAccounts = React.useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getAccountsForSelect(debouncedSearch);

        if (!response.success) {
          if (response.redirect) {
            router.replace(response.redirect);
            return;
          }
          setError(response.error || 'Failed to fetch accounts');
          setAccounts([]);
          return;
        }

        setAccounts(response.data || []);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setError('Failed to load accounts. Please try again.');
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    }, [debouncedSearch, router]);
    // Derive selected account from accounts and selectedAccountId using the new findAccount function
    const selectedAccount = React.useMemo(
      () =>
        selectedAccountId
          ? findAccount(accounts, selectedAccountId)
          : undefined,
      [accounts, selectedAccountId, findAccount]
    );
    const handleAccountCreated = React.useCallback(() => {
      setSheetOpen(false);
      fetchAccounts(); // Refresh the accounts list
    }, [fetchAccounts]);
    React.useEffect(() => {
      let mounted = true;

      const fetch = async () => {
        if (!mounted) return;
        await fetchAccounts();
      };

      fetch();
      return () => {
        mounted = false;
      };
    }, [fetchAccounts]);

    const handleSelect = React.useCallback(
      (account: AccountSelectData) => {
        onSelect(account);
        setOpen(false);
      },
      [onSelect]
    );

    return (
      <div className="relative w-full">
        <Popover open={open} onOpenChange={setOpen} modal>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                'relative h-9 w-full pr-8',
                'text-sm',
                !selectedAccount && 'text-muted-foreground',
                className
              )}
            >
              <div className="flex w-full items-center overflow-hidden">
                <div className="min-w-0 flex-1 text-left">
                  <span className="block truncate">
                    {selectedAccount
                      ? selectedAccount.title
                      : 'Select account...'}
                  </span>
                </div>
                {selectedAccount && (
                  <span className="text-muted-foreground ml-2 shrink-0">
                    {selectedAccount.number}
                  </span>
                )}
              </div>
              <ChevronsUpDown className="absolute right-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="max-h-[300px] w-(--radix-popover-trigger-width) overflow-hidden p-0"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <Command className="w-full">
              <CommandInput
                placeholder="Search accounts..."
                value={search}
                onValueChange={setSearch}
                className="h-9"
                aria-label="Search accounts"
              />
              {showCreate && (
                <div className="border-t px-2">
                  <AccountForm
                    open={sheetOpen}
                    onOpenChange={setSheetOpen}
                    onSuccess={handleAccountCreated}
                    isNestedForm
                  >
                    <Button
                      onClick={() => setSheetOpen(true)}
                      variant="ghost"
                      className="w-full justify-start py-1.5 text-sm"
                    >
                      + Add new account
                    </Button>
                  </AccountForm>
                </div>
              )}
              <CommandEmpty className="p-2 text-sm">
                {loading ? 'Loading...' : error || 'No accounts found'}
              </CommandEmpty>
              <CommandGroup className="max-h-[200px] overflow-y-auto">
                {accounts?.map((account) => (
                  <AccountItem
                    key={account.id}
                    account={account}
                    level={0}
                    selectedAccountId={selectedAccountId}
                    onSelect={handleSelect}
                  />
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

AccountSelect.displayName = 'AccountSelect';

export { AccountSelect };
export type { AccountSelectData, AccountSelectProps };
