import { prisma } from '@/lib/prisma';

const FRANKFURTER_API = 'https://api.frankfurter.dev/v1';

export type FrankfurterResponse = {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
};

/**
 * Fetches latest exchange rates from Frankfurter API (ECB data, free, no key).
 * Stores each rate relative to USD in DailyExchangeRate.
 */
export async function fetchAndStoreDailyRates(): Promise<{ count: number; date: string }> {
  const res = await fetch(`${FRANKFURTER_API}/latest?from=USD`);
  if (!res.ok) throw new Error(`Frankfurter API error: ${res.status}`);

  const data: FrankfurterResponse = await res.json();
  const rateDate = new Date(data.date);

  // Normalize to midnight UTC
  rateDate.setUTCHours(0, 0, 0, 0);

  const entries = Object.entries(data.rates).map(([targetCurrency, rate]) => ({
    rateDate,
    baseCurrency: 'USD',
    targetCurrency,
    rate,
  }));

  // Add USD->USD = 1 (self-rate)
  entries.push({
    rateDate,
    baseCurrency: 'USD',
    targetCurrency: 'USD',
    rate: 1,
  });

  // Upsert each rate — skip existing date+pair rows
  let count = 0;
  for (const entry of entries) {
    try {
      await prisma.dailyExchangeRate.create({ data: entry });
      count++;
    } catch {
      // Unique constraint violation — rate already exists for this date
    }
  }

  return { count, date: data.date };
}

/**
 * Gets the latest rate for a currency pair, with fallback.
 * Tries DailyExchangeRate first, then manual ExchangeRate.
 */
export async function getLatestRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number | null> {
  if (fromCurrency === toCurrency) return 1;

  // Try daily rates using triangulation via USD base
  if (fromCurrency !== 'USD' && toCurrency !== 'USD') {
    const [fromRate, toRate] = await Promise.all([
      prisma.dailyExchangeRate.findFirst({
        where: { baseCurrency: 'USD', targetCurrency: fromCurrency },
        orderBy: { rateDate: 'desc' },
      }),
      prisma.dailyExchangeRate.findFirst({
        where: { baseCurrency: 'USD', targetCurrency: toCurrency },
        orderBy: { rateDate: 'desc' },
      }),
    ]);
    if (fromRate && toRate) return toRate.rate / fromRate.rate;
  }

  // Direct lookup (one side is USD)
  const direct = fromCurrency === 'USD'
    ? await prisma.dailyExchangeRate.findFirst({
        where: { baseCurrency: 'USD', targetCurrency: toCurrency },
        orderBy: { rateDate: 'desc' },
      })
    : await prisma.dailyExchangeRate.findFirst({
        where: { baseCurrency: 'USD', targetCurrency: fromCurrency },
        orderBy: { rateDate: 'desc' },
      });
  if (direct) return fromCurrency === 'USD' ? direct.rate : 1 / direct.rate;

  // Fallback to manual ExchangeRate table
  const manual = await prisma.exchangeRate.findFirst({
    where: { sourceCurrency: fromCurrency, targetCurrency: toCurrency },
    orderBy: { asOfDate: 'desc' },
  });
  return manual?.rate ?? null;
}
