import { NextResponse } from 'next/server';
import { fetchAndStoreDailyRates } from '@/lib/exchange-rate-fetcher';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // Require secret for cron auth
  const authHeader = request.headers.get('authorization');
  const secret = request.headers.get('x-cron-secret');

  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await fetchAndStoreDailyRates();
    return NextResponse.json({
      success: true,
      message: `Fetched and stored ${result.count} exchange rates for ${result.date}`,
      ...result,
    });
  } catch (error) {
    console.error('Cron: exchange rate fetch failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
