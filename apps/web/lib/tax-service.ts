import { prisma } from '@/lib/prisma';
import { getLatestRate } from './exchange-rate-fetcher';
import { getCountry } from './countries/data';

export type TaxComputationInput = {
  companyId: string;
  amount: number;
  taxRateId?: string | null;
  taxCodeId?: string | null;
  isPurchase: boolean;
  isTaxInclusive?: boolean; // If true, amount includes tax (TTC)
  countryCode?: string;     // For country-specific tax rules
};

export type TaxComputationResult = {
  taxAmount: number;
  taxableAmount: number;
  rate: number;
  taxCodeName: string | null;
  agencyName: string | null;
  isTaxInclusive: boolean;
  htAmount: number;  // Net amount (HT)
  ttcAmount: number; // Gross amount (TTC)
};

/**
 * Computes tax supporting both tax-exclusive (HT→TTC) and tax-inclusive (TTC→HT) modes.
 * Country config determines the default behavior.
 */
export async function computeTax({
  companyId,
  amount,
  taxRateId,
  isPurchase,
  isTaxInclusive,
  countryCode,
}: TaxComputationInput): Promise<TaxComputationResult> {
  const defaultResult: TaxComputationResult = {
    taxAmount: 0, taxableAmount: amount, rate: 0,
    taxCodeName: null, agencyName: null,
    isTaxInclusive: isTaxInclusive ?? false,
    htAmount: amount, ttcAmount: amount,
  };

  if (!taxRateId) return defaultResult;

  const taxRate = await prisma.taxRate.findUnique({
    where: { id: taxRateId },
    include: { taxCode: true, taxAgency: true },
  });
  if (!taxRate || !taxRate.isActive) return defaultResult;

  const agency = taxRate.taxAgency;
  if (agency) {
    if (isPurchase && !agency.taxTrackedOnPurchases) return defaultResult;
    if (!isPurchase && !agency.taxTrackedOnSales) return defaultResult;
  }

  // Determine tax-inclusive mode: explicit flag > country default > tax code setting
  const country = countryCode ? getCountry(countryCode) : null;
  const inclusive = isTaxInclusive ?? country?.tax.taxInclusiveDefault ?? false;

  let htAmount: number, ttcAmount: number, taxAmount: number;

  if (inclusive) {
    // Tax-inclusive: amount includes tax (TTC → HT)
    ttcAmount = amount;
    htAmount = amount / (1 + taxRate.rate / 100);
    taxAmount = ttcAmount - htAmount;
  } else {
    // Tax-exclusive: amount excludes tax (HT → TTC)
    htAmount = amount;
    taxAmount = (amount * taxRate.rate) / 100;
    ttcAmount = htAmount + taxAmount;
  }

  return {
    taxAmount,
    taxableAmount: htAmount,
    rate: taxRate.rate,
    taxCodeName: taxRate.taxCode?.name ?? null,
    agencyName: taxRate.agencyName,
    isTaxInclusive: inclusive,
    htAmount,
    ttcAmount,
  };
}

/**
 * Returns a tax computation result ready to store on a transaction.
 * Includes the applied rate for audit trail.
 */
export async function computeAndPrepareForStorage(input: TaxComputationInput) {
  const result = await computeTax(input);
  return {
    ...result,
    appliedRate: result.rate,
    rateSource: 'TAX_RATE' as const,
    taxMode: result.isTaxInclusive ? 'INCLUSIVE' : 'EXCLUSIVE' as const,
  };
}

export async function getDefaultTaxRate(companyId: string) {
  return prisma.taxRate.findFirst({
    where: { companyId, isActive: true, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDefaultCurrency(companyId: string) {
  const currency = await prisma.companyCurrency.findFirst({
    where: { companyId, isDefault: true },
  });
  return currency?.currency || 'TND';
}

/**
 * Converts an amount between currencies and returns the applied rate for storage.
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
) {
  if (fromCurrency === toCurrency) return { convertedAmount: amount, appliedRate: 1, rateSource: 'EQUAL' as const };

  const rate = await getLatestRate(fromCurrency, toCurrency);
  if (rate === null) throw new Error(`No exchange rate found for ${fromCurrency} → ${toCurrency}`);

  return {
    convertedAmount: amount * rate,
    appliedRate: rate,
    rateSource: 'DAILY_RATE' as const,
  };
}

/**
 * Formats an amount according to the currency's decimal places.
 */
export function formatAmountByCurrency(amount: number, currencyCode: string): string {
  const decimals: Record<string, number> = {
    TND: 3, USD: 2, EUR: 2, GBP: 2, JPY: 0, KWD: 3,
    BHD: 3, OMR: 3, IQD: 3, JOD: 3,
    CLP: 0, KRW: 0, XOF: 0, XAF: 0,
  };
  return amount.toFixed(decimals[currencyCode] ?? 2);
}
