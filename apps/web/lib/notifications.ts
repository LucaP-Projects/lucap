'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Creates an in-app notification for a user.
 */
export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type as any,
      title: params.title,
      message: params.message,
    },
  });
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationRead(notificationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  return prisma.notification.update({
    where: { id: notificationId, userId: session.user.id },
    data: { read: true, readAt: new Date() },
  });
}

/**
 * Marks all unread notifications as read for the current user.
 */
export async function markAllNotificationsRead() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  return prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true, readAt: new Date() },
  });
}

/**
 * Gets unread notification count and recent notifications for the current user.
 */
export async function getNotifications(limit = 20) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { unreadCount: 0, notifications: [] };

  const [unreadCount, notifications] = await Promise.all([
    prisma.notification.count({ where: { userId: session.user.id, read: false } }),
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
  ]);

  return { unreadCount, notifications };
}

/**
 * Notify all company users about an event (e.g., payment received).
 */
export async function notifyCompanyUsers(companyId: string, type: string, title: string, message: string) {
  const userCompanies = await prisma.userCompany.findMany({
    where: { companyId, isActive: true },
    select: { userId: true },
  });

  for (const uc of userCompanies) {
    await createNotification({ userId: uc.userId, type, title, message }).catch(() => {});
  }
}
