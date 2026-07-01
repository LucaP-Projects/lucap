import { google } from "@ai-sdk/google";
import { streamText, tool, type UIMessage } from "ai";
import { useChat as useChatBase, Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

// Use the appropriate model
export const defaultModel = google("gemini-1.5-flash");

/**
 * Shared transport for the chat.
 * In AI SDK 5+, configuration is handled via transport objects.
 */
export const chatTransport = new DefaultChatTransport({
  api: "/api/chat",
});

/**
 * Creates a standalone Chat instance (v5 pattern).
 */
export function createChat(options: any = {}) {
  return new Chat({
    transport: chatTransport,
    ...options,
  });
}

/**
 * A customized useChat hook that follows the new AI SDK 5.0+ pattern.
 * It returns { messages, sendMessage, status, setMessages }.
 */
export function useChat(options: any = {}) {
  return useChatBase({
    transport: chatTransport,
    ...options,
  });
}

/**
 * Helper to get the text content from a message.
 */
export function getMessageText(message: any): string {
  if (!message) return "";
  if (typeof message.content === "string") return message.content;
  if (Array.isArray(message.content)) {
    return message.content
      .filter((part: any) => part.type === "text")
      .map((part: any) => part.text)
      .join("");
  }
  return "";
}
