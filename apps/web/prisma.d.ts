import { CustomizationSettingsInput } from '@/components/base/sideBar/customize/types';
import {
  CustomFieldValue,
  DiscountApplicationTime,
  DiscountType,
  PaymentMethod
} from '@/lib/generated/prisma/enums';

declare global {
  namespace PrismaJson {
    type WeeklyAnchor = {
      type: 'weekly';
      day: number; // 1-7
    };

    type MonthlyAnchor = {
      type: 'monthly';
      day: number | 'last'; // 1-28 or 'last'
    };

    type AnchorConfig = WeeklyAnchor | MonthlyAnchor;
    type PaymentFrequency = 'ONE_TIME' | 'SUBSCRIPTION' | 'INSTALLMENTS';
    type InvoiceType =
      | 'ONE_TIME'
      | 'SUBSCRIPTION'
      | 'INSTALLMENTS'
      | 'INDIVIDUAL_INVOICE'
      | 'ESTIMATE'
      | 'DELAYED_CREDIT'
      | 'CREDIT_MEMO'
      | 'SALES_RECEIPT'
      | 'REFUND_RECEIPT'
      | 'DELAYED_CHARGE';

    type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
    enum AdjustmentStrategy {
      DISTRIBUTE_TO_FUTURE = 'DISTRIBUTE_TO_FUTURE',
      APPEND_TO_REMAINING = 'APPEND_TO_REMAINING',
      LAST_INSTALLMENT = 'LAST_INSTALLMENT',
      NEXT_INSTALLMENT = 'NEXT_INSTALLMENT',
      WEIGHTED_DISTRIBUTION = 'WEIGHTED_DISTRIBUTION',
      PROPORTIONAL_REMAINING = 'PROPORTIONAL_REMAINING',
      FIXED_FIRST = 'FIXED_FIRST',
      CUSTOM = 'CUSTOM'
    }
    type PauseRecord = {
      startDate: string; // ISO date
      endDate?: string; // ISO date
      remainingDays: number; // Days remaining in interrupted period
    };

    type ItemMetadata = {
      // Supplier information
      supplierId?: string;
      supplierSku?: string;
      supplierPrice?: number;

      // Product dimensions
      weight?: number;
      length?: number;
      width?: number;
      height?: number;
      dimensionUnit?: 'cm' | 'in' | 'mm';
      weightUnit?: 'kg' | 'lb' | 'oz';

      // Pricing history
      priceHistory?: Array<{
        price: number;
        effectiveDate: string;
        endDate?: string;
      }>;

      // Variants
      variants?: Array<{
        id: string;
        name: string;
        sku?: string;
        attributes: Record<string, string>;
        price?: number;
      }>;

      // Additional attributes
      brand?: string;
      manufacturer?: string;
      modelNumber?: string;
      barcode?: string;
      hsCode?: string;

      // Digital product specifics
      isDigital?: boolean;
      downloadUrl?: string;
      licenseType?: string;

      // Custom properties
      properties?: Record<string, string | number | boolean>;
    };
    type PaymentEventSnapshot = {
      name?: string;
      description?: string;
      versionId?: string;
      versionNumber?: number;
      type?: InvoiceType;
      snapshotTimestamp?: string; // ISO date
      amount: number;
      frequency?: FrequencyConfig;
      initialFee?: InitialFee;

      // Organization details
      organization?: string;
      taxId?: string;
      address?: Address;
      logo?: string;
      cc?: string;
      // Customer details at time of snapshot
      customer?: {
        name: string;
        type: string;
        address?: Address;
      };

      // Payment configuration
      generateInvoiceNow?: boolean;
      discountType?: DiscountType | null;
      discountValue?: number;
      discountApplicationTime?: DiscountApplicationTime;
      discountAmount?: number;
      taxAmount?: number;
      taxRate?: number;

      dueDate?: string; // ISO date
      issueDate?: string; // ISO date
      adjustmentStrategy?: AdjustmentStrategy;
      snapshotData?: {
        originalAmount: number;
        customAmount?: number;
        modificationReason?: string;
        partialAmount?: number;
        partialAmountReason?: string;
        anchorDate?: string;
        trialEndDate?: string;
        isPartialPeriod?: boolean;
        partialPeriodDays?: number;
      };
      partialPayments?: {
        enabled: boolean;
        minimumAmount?: {
          type: 'percentage' | 'fixed';
          value: number;
        };
        maximumPayments?: number;
        rules?: {
          minimumDaysBetweenPayments?: number;
          requireApproval?: boolean;
          gracePeriodDays?: number;
        };
      };
      customPdfSettings?: CustomizationSettingsInput;
      color?: string;
      // Enhanced payment tracking
      paymentTracking?: {
        totalPaid: number;
        remainingBalance: number;
        lastPaymentDate?: string;
        numberOfPayments: number;
        nextMinimumDue?: number;
        paymentHistory: PaymentRecord[];
      };
      items?: {
        productName: string;
        description?: string;
        quantity: number;
        rate: number;
        amount: number;
        taxable: boolean;
        sku?: string | null;
        // status?: PaymentStatus;
        // paidAmount?: number;
      }[];
    };

    type FrequencyConfig = {
      unit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
      value: number;
    };

    type InitialFee = {
      amount: number;
      description?: string;
    };
    type InvoiceHandling = {
      action: 'REGENERATED' | 'ADJUSTED' | 'FUTURE_ONLY';
      affectedInvoiceId?: string;
      previousInvoiceId?: string;
      adjustmentInvoiceId?: string;
    };
    type PriceModification = {
      amount: number;
      previousAmount: number;
      effectiveDate: string;
      reason?: string;
      modifiedBy: string;
      invoiceHandling: InvoiceHandling;
    };
    type PaymentRecord = {
      id: string;
      amount: number;
      date: string; // ISO date
      paymentMethod: PaymentMethod;
      reference?: string;
      balance: number; // Remaining balance after this payment
    };

    // Settings types for different payment frequencies
    type OneTimeSettings = {
      generateInvoiceNow?: boolean;
      amount: number;
      defaultDueDate?: string; // ISO date
    };

    type SubscriptionSettings = {
      amount: number;
      frequency: FrequencyConfig;
      initialFee?: InitialFee;
      // New anchor date handling
      useAnchorDate: boolean;
      anchorConfig?: AnchorConfig; // Optional, only present if useAnchorDate is true

      // Optional configuration
      allowPause: boolean;
      trialPeriodDays?: number;
    };

    type InstallmentSettings = {
      totalAmount: number;
      numberOfInstallments: number;
      frequency: FrequencyConfig;
      startDate: string; // ISO date
      adjustmentStrategy?: AdjustmentStrategy;
      downPayment?: {
        amount: number;
        required: boolean;
      };
    };

    type PaymentSettings = {
      type: PaymentFrequency;
      settings: OneTimeSettings | SubscriptionSettings | InstallmentSettings;
    };

    // Progress tracking types
    type BaseProgress = {
      totalAmount: number;
      totalPaid: number;
      remainingBalance: number;
      status: PaymentStatus;
      lastPaymentDate?: string;
      lastInvoiceDate?: string;
      payments: PaymentRecord[];
      priceModifications: PriceModification[];
    };

    type OneTimeProgress = BaseProgress & {
      type: 'ONE_TIME';
      invoiceGenerated: boolean;
      invoiceId?: string;
      dueDate: string;
      originalAmount: number;
      currentAmount: number;
    };
    type SubscriptionStatus =
      // Active States
      | 'ACTIVE' // Regular active subscription with current payments
      | 'TRIAL' // In trial period
      | 'PAUSED' // Temporarily suspended

      // Payment States that affect service
      | 'PAST_DUE' // Replace PARTIAL - payment late but in grace period
      | 'DELINQUENT' // Replace OVERDUE - payment very late| service affected

      // End States
      | 'CANCELLED' // Subscription ended (with balance info in progress)
      | 'EXPIRED'; // For fixed-term subscriptions that completed normally

    // Define SubscriptionProgress without the conflicting status field from BaseProgress
    type SubscriptionProgress = Omit<BaseProgress, 'priceModifications'> & {
      type: 'SUBSCRIPTION';
      subscriptionStatus: SubscriptionStatus;
      frequency: FrequencyConfig;
      startDate: string;
      effectiveStartDate: string;
      endDate: string | null;
      nextDueDate: string;
      currentPeriod: number;
      isInfinite: boolean;

      // Anchor date configuration
      anchorConfig?: AnchorConfig;
      lastAnchorDate?: string;
      nextAnchorDate?: string;
      lastProcessedDate?: string;

      // Partial period handling
      currentPeriodIsPartial?: boolean;
      partialPeriodDays?: number;

      // History tracking
      statusHistory: StatusHistoryRecord[];
      pauseHistory: PauseRecord[];
      currentPause?: PauseRecord;
      periods: PeriodDetails[];
      cancellationDate?: string;

      // Modifications
      initialFeeModifications?: PriceModification[];
      priceModifications?: PriceModification[];
    };

    type InstallmentProgress = BaseProgress & {
      type: 'INSTALLMENTS';
      startDate: string; // ISO date
      totalInstallments: number;
      currentInstallment: number;
      frequency: FrequencyConfig;
      installments: PeriodDetails[];
    };

    type PeriodDetails = {
      periodNumber: number;
      startDate: string;
      endDate: string;
      dueDate: string;
      amount: number;
      paid: number;
      remaining: number;
      status: PaymentStatus;
      invoiceId?: string;
      isPartialPeriod?: boolean;
      partialPeriodDays?: number;
      payments: PaymentRecord[];
    };
    type StatusHistoryRecord = {
      status: SubscriptionStatus;
      date: string;
      reason?: string;
    };

    type PaymentProgress =
      | OneTimeProgress
      | SubscriptionProgress
      | InstallmentProgress;
    interface Address {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    }
    interface CustomerMetadata {
      industry?: string;
      marketingPreferences?: {
        emailOptIn: boolean;
        smsOptIn: boolean;
      };
      hasCustomerPortalAccess?: boolean;
      customFields?: CustomFieldValue[];
    }
  }
}
export {};
