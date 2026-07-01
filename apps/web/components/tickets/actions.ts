'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ticketSchema, messageSchema, TicketInput, MessageInput } from './schema';
import { headers } from 'next/headers';

export async function getTickets(companyId: string) {
  return await prisma.ticket.findMany({
    where: { companyId },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        orderBy: { date: 'asc' },
      },
      createdBy: {
        select: { name: true, image: true, email: true }
      }
    }
  });
}

export async function getTicket(id: string) {
  return await prisma.ticket.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { date: 'asc' },
        include: {
          messageAttachments: true
        }
      },
      createdBy: {
        select: { name: true, image: true, email: true }
      },
      company: true
    }
  });
}

export async function createTicket(data: TicketInput, companyId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) throw new Error('Unauthorized');

  const validated = ticketSchema.parse(data);

  const ticket = await prisma.ticket.create({
    data: {
      title: validated.title,
      service: validated.service,
      companyId: companyId,
      createdById: session.user.id,
      status: 'OPEN',
      messages: {
        create: {
          author: session.user.name || 'Client',
          message: validated.message,
          type: 'text'
        }
      }
    }
  });

  revalidatePath(`/[company-slug]/tickets`, 'layout');
  revalidatePath(`/[company-slug]/accountant-dashboard/tickets`, 'layout');
  return ticket;
}

export async function sendMessage(data: MessageInput) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) throw new Error('Unauthorized');

  const validated = messageSchema.parse(data);

  const message = await prisma.message.create({
    data: {
      ticketId: validated.ticketId,
      author: session.user.name || 'User',
      message: validated.message,
      type: validated.type,
    }
  });

  await prisma.ticket.update({
    where: { id: validated.ticketId },
    data: { updatedAt: new Date() }
  });

  revalidatePath(`/[company-slug]/tickets/${validated.ticketId}`, 'page');
  revalidatePath(`/[company-slug]/accountant-dashboard/tickets/${validated.ticketId}`, 'page');
  return message;
}

export async function updateTicketStatus(ticketId: string, status: string) {
  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status }
  });

  revalidatePath(`/[company-slug]/tickets`, 'layout');
  revalidatePath(`/[company-slug]/accountant-dashboard/tickets`, 'layout');
  return ticket;
}
