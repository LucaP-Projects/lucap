import { z } from 'zod';

export const ticketSchema = z.object({
  title: z.string().min(1, "Subject required"),
  service: z.string().optional(),
  message: z.string().min(1, "Message required"),
});

export const messageSchema = z.object({
  ticketId: z.string().uuid(),
  message: z.string().min(1, "Message cannot be empty"),
  type: z.enum(["text", "activity", "note"]).default("text"),
});

export type TicketInput = z.infer<typeof ticketSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
