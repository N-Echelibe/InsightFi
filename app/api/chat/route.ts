import { streamText, UIMessage, convertToModelMessages, consumeStream } from "ai";

export const maxDuration = 30;

const systemPrompt = `You are a helpful AI financial advisor assistant for FinanceAI, a personal finance management app. You help users with:

1. Budget planning and optimization
2. Spending analysis and recommendations
3. Investment guidance and portfolio suggestions
4. Savings strategies and goal setting
5. General financial literacy questions

Always provide practical, actionable advice. When discussing investments, remind users that past performance doesn't guarantee future results. Be encouraging but realistic about financial goals.

Keep responses concise and easy to understand. Use bullet points for lists. If users ask about specific financial products, remind them to do their own research or consult a licensed financial advisor for personalized advice.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const prompt = convertToModelMessages(messages);

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: systemPrompt,
    messages: prompt,
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse({
    consumeSseStream: consumeStream,
  });
}
