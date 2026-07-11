'use server';

import { prisma } from '@/lib/prisma';

export type JobPayload = Record<string, unknown>;

/**
 * Enqueues a background job for async processing.
 */
export async function enqueueJob(type: string, payload: JobPayload, options?: {
  companyId?: string;
  priority?: number;
  scheduledAt?: Date;
  maxRetries?: number;
}) {
  return prisma.jobQueue.create({
    data: {
      type,
      status: 'PENDING',
      payload,
      priority: options?.priority ?? 0,
      maxRetries: options?.maxRetries ?? 3,
      scheduledAt: options?.scheduledAt ?? new Date(),
      companyId: options?.companyId ?? null,
    },
  });
}

/**
 * Processes the next pending job. Called by a worker/cron endpoint.
 */
export async function processNextJob() {
  // Find the highest priority pending job (oldest first)
  const job = await prisma.jobQueue.findFirst({
    where: {
      status: 'PENDING',
      scheduledAt: { lte: new Date() },
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  });

  if (!job) return null;

  // Mark as processing
  await prisma.jobQueue.update({
    where: { id: job.id },
    data: { status: 'PROCESSING', startedAt: new Date() },
  });

  try {
    const result = await executeJob(job.type, job.payload as JobPayload);
    await prisma.jobQueue.update({
      where: { id: job.id },
      data: { status: 'COMPLETED', result, completedAt: new Date() },
    });
    return { id: job.id, status: 'COMPLETED', result };
  } catch (error: any) {
    const retryCount = job.retryCount + 1;
    if (retryCount >= job.maxRetries) {
      await prisma.jobQueue.update({
        where: { id: job.id },
        data: { status: 'FAILED', error: error.message, retryCount },
      });
    } else {
      await prisma.jobQueue.update({
        where: { id: job.id },
        data: { status: 'PENDING', error: error.message, retryCount },
      });
    }
    return { id: job.id, status: 'FAILED', error: error.message };
  }
}

/**
 * Routes job types to handler functions.
 */
async function executeJob(type: string, payload: JobPayload) {
  switch (type) {
    case 'SEND_EMAIL':
      return handleSendEmail(payload);
    case 'GENERATE_PDF':
      return handleGeneratePdf(payload);
    case 'GENERATE_REPORT':
      return handleGenerateReport(payload);
    default:
      throw new Error(`Unknown job type: ${type}`);
  }
}

async function handleSendEmail(payload: JobPayload) {
  const { to, subject, body } = payload as { to: string; subject: string; body: string };
  const { sendEmail } = await import('./email-service');
  return sendEmail({ to, subject, html: body });
}

async function handleGeneratePdf(_payload: JobPayload) {
  // PDF generation handler — to be implemented with puppeteer
  return { status: 'not_implemented' };
}

async function handleGenerateReport(_payload: JobPayload) {
  // Report generation handler — to be implemented
  return { status: 'not_implemented' };
}

/**
 * Processes all pending jobs (batch mode). Returns count processed.
 */
export async function drainQueue(limit = 10) {
  let count = 0;
  for (let i = 0; i < limit; i++) {
    const result = await processNextJob();
    if (!result) break;
    count++;
  }
  return { processed: count };
}
