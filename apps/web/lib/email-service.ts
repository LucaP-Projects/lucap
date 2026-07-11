'use server';

import { prisma } from '@/lib/prisma';

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:8081/api/v1';

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  cc?: string[];
  bcc?: string[];
  attachments?: { filename: string; content: string; contentType: string }[];
};

/**
 * Sends an email via the external email microservice.
 * Falls back to console.log in development.
 */
export async function sendEmail(payload: EmailPayload) {
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_SERVICE_URL) {
    console.log('[Email Dev]', { to: payload.to, subject: payload.subject });
    return { success: true, mock: true };
  }

  const res = await fetch(`${EMAIL_SERVICE_URL}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Email service error: ${res.status}`);
  return res.json();
}

/**
 * Sends an invoice to the customer.
 */
export async function sendInvoiceEmail(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: { select: { displayName: true, primaryEmail: true } },
      company: { select: { name: true, email: true } },
    },
  });

  if (!invoice?.customer?.primaryEmail) throw new Error('Customer has no email');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Invoice ${invoice.number}</h2>
      <p>Dear ${invoice.customer.displayName},</p>
      <p>Your invoice of ${invoice.amount.toFixed(3)} ${invoice.currency} is ready.</p>
      <p>Due date: ${invoice.dueDate.toLocaleDateString()}</p>
      <p>Status: ${invoice.status}</p>
      <hr />
      <p style="color: #666; font-size: 12px;">${invoice.company?.name} — ${invoice.company?.email || ''}</p>
    </div>
  `;

  return sendEmail({
    to: invoice.customer.primaryEmail,
    subject: `Invoice ${invoice.number} from ${invoice.company?.name || 'LucaP'}`,
    html,
  });
}

/**
 * Sends payment receipt to the customer.
 */
export async function sendPaymentReceiptEmail(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      customer: { select: { displayName: true, primaryEmail: true } },
      invoice: { select: { number: true } },
      company: { select: { name: true } },
    },
  });

  if (!payment?.customer?.primaryEmail) throw new Error('Customer has no email');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Payment Received</h2>
      <p>Dear ${payment.customer.displayName},</p>
      <p>We received your payment of ${payment.amount.toFixed(3)}.</p>
      ${payment.invoice ? `<p>Reference: Invoice ${payment.invoice.number}</p>` : ''}
      <p>Payment method: ${payment.paymentMethod}</p>
      <hr />
      <p style="color: #666; font-size: 12px;">${payment.company?.name || 'LucaP'}</p>
    </div>
  `;

  return sendEmail({
    to: payment.customer.primaryEmail,
    subject: `Payment Received — ${payment.company?.name || 'LucaP'}`,
    html,
  });
}

/**
 * Sends overdue invoice reminder.
 */
export async function sendOverdueReminderEmail(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: { select: { displayName: true, primaryEmail: true } },
      company: { select: { name: true } },
    },
  });

  if (!invoice?.customer?.primaryEmail) throw new Error('Customer has no email');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Payment Reminder</h2>
      <p>Dear ${invoice.customer.displayName},</p>
      <p>This is a reminder that Invoice ${invoice.number} for ${invoice.amount.toFixed(3)} ${invoice.currency} is overdue.</p>
      <p>Original due date: ${invoice.dueDate.toLocaleDateString()}</p>
      <p>Please arrange payment at your earliest convenience.</p>
      <hr />
      <p style="color: #666; font-size: 12px;">${invoice.company?.name || 'LucaP'}</p>
    </div>
  `;

  return sendEmail({
    to: invoice.customer.primaryEmail,
    subject: `Overdue: Invoice ${invoice.number} — ${invoice.company?.name || 'LucaP'}`,
    html,
  });
}

// ─── Better Auth Email Helpers ───
// Better Auth passes: { to, subject, url/verificationUrl } depending on the plugin

export async function sendVerificationEmail(data: { to: string; subject?: string; verificationUrl?: string }) {
  const html = `<p>Click <a href="${data.verificationUrl || '#'}">here</a> to verify your email address.</p>`;
  return sendEmail({ to: data.to, subject: data.subject || 'Verify your email', html }).catch(() => {
    console.log(`[Auth Email Dev] Verification: ${data.to}`);
  });
}

export async function sendPasswordResetEmail(data: { to: string; subject?: string; resetUrl?: string; url?: string }) {
  const link = data.resetUrl || data.url || '#';
  const html = `<p>Click <a href="${link}">here</a> to reset your password.</p>`;
  return sendEmail({ to: data.to, subject: data.subject || 'Reset your password', html }).catch(() => {
    console.log(`[Auth Email Dev] Password Reset: ${data.to}`);
  });
}

export async function sendMagicLinkEmail(data: { to: string; subject?: string; url?: string; magicLinkUrl?: string }) {
  const link = data.magicLinkUrl || data.url || '#';
  const html = `<p>Click <a href="${link}">here</a> to sign in.</p>`;
  return sendEmail({ to: data.to, subject: data.subject || 'Sign in to LucaP', html }).catch(() => {
    console.log(`[Auth Email Dev] Magic Link: ${data.to}`);
  });
}
