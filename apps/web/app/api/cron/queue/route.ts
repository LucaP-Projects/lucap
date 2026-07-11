import { NextResponse } from 'next/server';
import { drainQueue } from '@/lib/job-queue';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const secret = request.headers.get('x-cron-secret');

  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await drainQueue(20);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
