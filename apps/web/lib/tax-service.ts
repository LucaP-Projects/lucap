import { prisma } from '@/lib/prisma';
import { getLatestRate } from './exchange-rate-fetcher';

export type TaxComputationInput = {
  companyId: string;
  amount: number;
  taxRateId?: string | null;
  taxCodeId?: string | null;
  isPurchase: boolean;
};

export type TaxComputationResult = {
  taxAmount: number;
  taxableAmount: number;
  rate: number;
  taxCodeName: string | null;
  agencyName: string | null;
};

/**
 * Computes tax for a given amount using the company's tax rate.
 * Handles tax code grouping and agency assignment.
 */
export async function computeTax({
  companyId,
  amount,
  taxRateId,
  taxCodeId,
  isPurchase,
}: TaxComputationInput): Promise<TaxComputationResult> {
  const defaultResult: TaxComputationResult = {
    taxAmount: 0,
    taxableAmount: amount,
    rate: 0,
    taxCodeName: null,
    agencyName: null,
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

  const taxAmount = (amount * taxRate.rate) / 100;

  return {
    taxAmount,
    taxableAmount: amount,
    rate: taxRate.rate,
    taxCodeName: taxRate.taxCode?.name ?? null,
    agencyName: taxRate.agencyName,
  };
}

/**
 * Returns the default tax rate for a company (first active rate).
 */
export async function getDefaultTaxRate(companyId: string) {
  return prisma.taxRate.findFirst({
    where: { companyId, isActive: true, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Returns the default currency for a company.
 */
export async function getDefaultCurrency(companyId: string) {
  const currency = await prisma.companyCurrency.findFirst({
    where: { companyId, isDefault: true },
  });
  return currency?.currency || 'TND';
}

/**
 * Converts an amount between two currencies using the latest global exchange rate.
 * Uses DailyExchangeRate (auto-fetched) first with triangulation via USD,
 * falls back to manual ExchangeRate table.
 * Best practice: store the applied rate on the transaction, don't recalculate.
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
) {
  if (fromCurrency === toCurrency) return amount;

  const rate = await getLatestRate(fromCurrency, toCurrency);
  if (rate === null) throw new Error(`No exchange rate found for ${fromCurrency} → ${toCurrency}`);
  return amount * rate;
}
