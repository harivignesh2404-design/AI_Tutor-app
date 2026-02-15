import { NextRequest, NextResponse } from "next/server";
import { getSession, isPremium } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { openai } from "@/lib/openai";
import { retrieveRelevantChunks } from "@/lib/rag";

const SYSTEM_FREE = `You are a helpful AI teacher. Answer based ONLY on the provided notes. Keep answers concise and clear. Do not add external references or YouTube links.`;

const SYSTEM_PREMIUM = `You are a premium AI teacher. Answer based on the provided notes. For premium users you should:
1. Give well-explained, detailed answers.
2. When useful, suggest a reference YouTube search query (one line) in the format: [YouTube: <search query>].
3. When a concept benefits from a diagram or visual, include a short Mermaid diagram in a fenced code block with language "mermaid".
Keep answers educational and structured.`;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!openai)
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  try {
    const body = await req.json();
    const { message } = body;
    if (!message || typeof message !== "string")
      return NextResponse.json({ error: "Message required" }, { status: 400 });

    await prisma.message.create({
      data: { userId: session.user.id, role: "user", content: message },
    });

    const contextChunks = await retrieveRelevantChunks(session.user.id, message, 8);
    const context = contextChunks.length
      ? "Relevant excerpts from the student's notes:\n\n" + contextChunks.join("\n\n---\n\n")
      : "No relevant notes found. Say you don't have enough context from their notes and suggest they add more notes.";

    const systemContent = isPremium(session.user.tier) ? SYSTEM_PREMIUM : SYSTEM_FREE;
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemContent + "\n\n" + context },
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1024,
    });
    const assistantContent = completion.choices[0]?.message?.content ?? "I couldn't generate a response.";

    await prisma.message.create({
      data: { userId: session.user.id, role: "assistant", content: assistantContent },
    });

    const hasMermaid = /```mermaid[\s\S]*?```/i.test(assistantContent);
    const youtubeMatch = assistantContent.match(/\[YouTube:\s*([^\]]+)\]/);
    const youtubeQuery = youtubeMatch ? youtubeMatch[1].trim() : null;

    return NextResponse.json({
      reply: assistantContent,
      premium: isPremium(session.user.tier),
      hasVisual: hasMermaid,
      youtubeQuery: isPremium(session.user.tier) ? youtubeQuery : null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
