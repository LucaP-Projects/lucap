import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { retrieveRagContext } from "@/lib/rag-retrieve";

const model = google("gemini-1.5-flash");

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, companyId, uiContext, references } = await req.json();

  const lastMessage = messages?.[messages.length - 1]?.content || "";

  let countryCode = "GLOBAL";
  if (companyId) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { countryCode: true, name: true }
    });
    if (company?.countryCode) countryCode = company.countryCode;
  }

  const { contextText, segments } = await retrieveRagContext(lastMessage, countryCode);

  let systemPrompt = `You are LucaP Assistant, a helpful AI expert in accounting, tax, and business management.
You have access to a knowledge base of regulatory and product documentation.
Answer based on the retrieved documentation. If the documentation doesn't contain the answer, say so.
Always cite the source document name when referencing specific information.`;

  if (segments.length > 0) {
    systemPrompt += `\n\nRELEVANT DOCUMENTATION:\n${contextText}`;
  }

  if (companyId) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, countryCode: true }
    });
    if (company) {
      systemPrompt += `\n\nYou are assisting: ${company.name} (${company.countryCode || "unknown country"}).`;
    }
  }

  if (uiContext) {
    systemPrompt += `\n\nCURRENT VIEWPORT:
    - Page: ${uiContext.title}
    - Path: ${uiContext.path}
    ${uiContext.data ? `- Data: ${JSON.stringify(uiContext.data)}` : ''}`;
  }

  if (references?.length) {
    systemPrompt += `\n\nREFERENCES:\n${references.map((r: any) => `- ${r.type}: ${r.label} (${r.id})`).join('\n')}`;
  }

  const result = await streamText({
    model,
    system: systemPrompt,
    messages,
    tools: {
        getCompanyInfo: tool({
            description: "Get basic information about the current company",
            inputSchema: z.object({ companyId: z.string() }),
            execute: async ({ companyId }: any) => {
                const company = await prisma.company.findUnique({ where: { id: companyId } });
                return JSON.parse(JSON.stringify(company));
            }
        }),
        getCustomerPayments: tool({
            description: "Get payments for a specific customer",
            inputSchema: z.object({ customerId: z.string(), months: z.number().default(4) }),
            execute: async ({ customerId, months }: any) => {
                const dateLimit = new Date();
                dateLimit.setMonth(dateLimit.getMonth() - (months || 4));
                const payments = await prisma.paymentEvent.findMany({
                    where: {
                        customerPaymentEvents: { some: { customerId } },
                        createdAt: { gte: dateLimit }
                    },
                    orderBy: { createdAt: 'desc' }
                });
                return JSON.parse(JSON.stringify(payments));
            }
        }),
        searchDocs: tool({
            description: "Search the documentation knowledge base for a specific query",
            inputSchema: z.object({ query: z.string(), country: z.string().optional() }),
            execute: async ({ query, country }: any) => {
                const cc = country || countryCode;
                const { contextText } = await retrieveRagContext(query, cc, 10);
                return contextText || "No relevant documentation found.";
            }
        })
    }
  });

  return result.toUIMessageStreamResponse({ originalMessages: messages });
}
