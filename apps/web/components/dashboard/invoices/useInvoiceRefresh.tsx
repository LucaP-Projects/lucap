'use client';

import { useCallback, createContext, useContext, useState } from 'react';
import { PaymentStatus } from '@/lib/generated/prisma/enums';
import { getInvoiceStats } from './actions';

// Define the context type
interface InvoiceRefreshContextType {
  refreshInvoiceStatus: (invoiceId: string, newStatus?: PaymentStatus) => void;
  getRefreshedStatus: (invoiceId: string) => PaymentStatus | null;
  refreshStats: () => Promise<void>;
}

// Create the context with a default value
const InvoiceRefreshContext = createContext<InvoiceRefreshContextType>({
  refreshInvoiceStatus: (invoiceId: string, newStatus?: PaymentStatus) => {},
  getRefreshedStatus: (invoiceId: string) => null,
  refreshStats: async () => {}
});

// Create a provider component
export function InvoiceRefreshProvider({
  children,
  onStatsRefreshed
}: {
  children: React.ReactNode;
  onStatsRefreshed?: (
    stats: Awaited<ReturnType<typeof getInvoiceStats>>
  ) => void;
}) {
  // Keep track of updated invoice statuses
  const [refreshedStatuses, setRefreshedStatuses] = useState<
    Record<string, PaymentStatus>
  >({});

  // Function to fetch and refresh stats - fixed to match the Promise<void> return type
  const refreshStats = useCallback(async () => {
    try {
      const newStats = await getInvoiceStats();
      if (onStatsRefreshed) {
        onStatsRefreshed(newStats);
      }
      // No return value to match the Promise<void> type
    } catch (error) {
      console.error('Failed to refresh invoice stats:', error);
    }
  }, [onStatsRefreshed]);

  // Function to update the status of a specific invoice
  const refreshInvoiceStatus = useCallback(
    (invoiceId: string, newStatus?: PaymentStatus) => {
      if (!newStatus) return;
      setRefreshedStatuses((prev) => ({
        ...prev,
        [invoiceId]: newStatus
      }));

      // After status changes, refresh stats
      refreshStats();
    },
    [refreshStats]
  );

  // Function to get the updated status if available
  const getRefreshedStatus = useCallback(
    (invoiceId: string) => refreshedStatuses[invoiceId] || null,
    [refreshedStatuses]
  );
  
  // Provide the context value
  return (
    <InvoiceRefreshContext.Provider
      value={{
        refreshInvoiceStatus,
        getRefreshedStatus,
        refreshStats
      }}
    >
      {children}
    </InvoiceRefreshContext.Provider>
  );
}

// Custom hook to use the context
export function useInvoiceRefresh() {
  return useContext(InvoiceRefreshContext);
}
