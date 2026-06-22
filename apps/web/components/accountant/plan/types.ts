export interface Account {
  id: string;
  title: string;
  number: string;
  composed_number: string;
  is_custom: boolean;
  parent_id: string | null;
  subAccounts?: Account[];
}

export interface AccountRowProps {
  account: Account;
  level: number;
  onExpand: (id: string) => void;
  isExpanded: boolean;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export interface AccountFormValues {
  title: string;
}

export interface UpdateAccountResponse {
  success: boolean;
  error?: string;
  redirect?: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  error?: string;
  redirect?: string;
}

export interface AccountsPageClientProps {
  initialAccounts: Account[];
}

export interface AccountQueryResult {
  id: string;
  title: string;
  number: string;
  composed_number: string;
  is_custom: boolean;
  parent_id: string | null;
  level: number;
}

// Helper function type
export interface AccountNode {
  id: string;
  title: string;
  number: string;
  composed_number: string;
  is_custom: boolean;
  parent_id: string | null;
  subAccounts: AccountNode[];
}
