import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";
import { query } from "@/lib/db";
import { retrieveRelevantChunks } from "@/lib/retrieve";
 
export const maxDuration = 60;
 
const bodySchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1),
});
 
export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { message } = parsed.data;
  let { conversationId } = parsed.data;
 
  if (!conversationId) {
    const [conv] = await query<{ id: string }>(
      `INSERT INTO conversations (title) VALUES ($1) RETURNING id`,
      [message.slice(0, 60)]
    );
    conversationId = conv.id;
  }
 
  // pull the last 10 turns for short-term memory
  const history = await query<{ role: string; content: string }>(
    `SELECT role, content FROM messages WHERE conversation_id = $1
     ORDER BY created_at DESC LIMIT 10`,
    [conversationId]
  );
  history.reverse();
 
  const chunks = await retrieveRelevantChunks(message, 5);
 
  const contextBlock = chunks
    .map((c, i) => `[${i + 1}] (Source: ${c.title}${c.pageNumber ? `, page ${c.pageNumber}` : ""})\n${c.content}`)
    .join("\n\n");
 
  const systemPrompt = `You are a knowledge base assistant. Answer the user's question using ONLY the context below. If the answer is not contained in the context, say you don't have that information — never guess. When you use a fact from the context, cite it inline using its bracket number, like [1] or [2].\n\nContext:\n${contextBlock || "No relevant context found."}`;
 
  const { text } = await generateText({
    model: google("gemini-3.6-flash"),
    system: systemPrompt,
    messages: [
      ...history.map((h) => ({ role: h.role as "user" | "assistant", content: h.content })),
      { role: "user", content: message },
    ],
  });
 
  const citations = chunks.map((c, i) => ({
    marker: i + 1,
    documentId: c.documentId,
    title: c.title,
    pageNumber: c.pageNumber,
    chunkId: c.chunkId,
  }));
 
  await query(
    `INSERT INTO messages (conversation_id, role, content) VALUES ($1, 'user', $2)`,
    [conversationId, message]
  );
  await query(
    `INSERT INTO messages (conversation_id, role, content, citations) VALUES ($1, 'assistant', $2, $3)`,
    [conversationId, text, JSON.stringify(citations)]
  );
 
  return NextResponse.json({ conversationId, answer: text, citations });
}
