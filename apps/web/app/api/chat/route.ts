import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Use the appropriate model
const model = google("gemini-1.5-flash");

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, companyId, uiContext, references } = await req.json();

  // Grounding the AI with rich context
  let systemPrompt = `You are LucaP Assistant, a helpful AI expert in accounting and business management.
  You are helping a user with their business data in the LucaP portal.
  Be concise, professional, and accurate.`;

  if (companyId) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true }
    });
    if (company) {
      systemPrompt += `\nYou are currently assisting with the company: ${company.name}.`;
    }
  }

  if (uiContext) {
    systemPrompt += `\n\nCURRENT USER VIEWPORT CONTEXT:
    - Page Title: ${uiContext.title}
    - Path: ${uiContext.path}
    ${uiContext.data ? `- Page Data Context: ${JSON.stringify(uiContext.data)}` : ''}
    Refer to this context if the user asks questions like "what's on my screen" or "analyze this list".`;
  }

  if (references && references.length > 0) {
    systemPrompt += `\n\nMENTIONED REFERENCES:
    ${references.map((r: any) => `- ${r.type}: ${r.label} (ID: ${r.id})`).join('\n')}
    Use these specific IDs when calling tools to ensure data accuracy.`;
  }

  const result = await streamText({
    model,
    system: systemPrompt,
    messages,
    tools: {
        getCompanyInfo: tool({
            description: "Get basic information about the current company",
            inputSchema: z.object({
                companyId: z.string()
            }),
            execute: async ({ companyId }: any) => {
                const company = await prisma.company.findUnique({
                    where: { id: companyId }
                });
                return JSON.parse(JSON.stringify(company));
            }
        }),
        getCustomerPayments: tool({
            description: "Get payments for a specific customer over a recent period",
            inputSchema: z.object({
                customerId: z.string(),
                months: z.number().default(4)
            }),
            execute: async ({ customerId, months }: any) => {
                const dateLimit = new Date();
                dateLimit.setMonth(dateLimit.getMonth() - (months || 4));

                const payments = await prisma.paymentEvent.findMany({
                    where: {
                        customerId,
                        createdAt: { gte: dateLimit }
                    },
                    orderBy: { createdAt: 'desc' }
                });
                return JSON.parse(JSON.stringify(payments));
            }
        })
    }
  });

  return result.toUIMessageStreamResponse({
      originalMessages: messages
  });
}
