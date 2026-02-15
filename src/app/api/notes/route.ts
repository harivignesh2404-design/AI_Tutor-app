import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { indexNote } from "@/lib/rag";
import { openai } from "@/lib/openai";

export async function GET() {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, contentType: true, createdAt: true, updatedAt: true },
  });
  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { title, content } = body;
    if (!title || !content)
      return NextResponse.json({ error: "Title and content required" }, { status: 400 });
    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        title: String(title).slice(0, 500),
        content: String(content).slice(0, 100_000),
        contentType: "text",
      },
    });
    if (openai) {
      try {
        await indexNote(note.id, note.content);
      } catch (e) {
        console.error("Indexing failed:", e);
      }
    }
    return NextResponse.json({ note: { id: note.id, title: note.title, createdAt: note.createdAt } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
