import { prisma } from "./db";
import { embedText, embedChunks, topKBySimilarity } from "./openai";

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 150;

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + CHUNK_SIZE, text.length);
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(" ", end);
      if (lastSpace > start) end = lastSpace;
    }
    chunks.push(text.slice(start, end).trim());
    start = end - (end - start > CHUNK_OVERLAP ? CHUNK_OVERLAP : 0);
  }
  return chunks.filter(Boolean);
}

export async function indexNote(noteId: string, content: string): Promise<void> {
  const chunks = chunkText(content);
  if (chunks.length === 0) return;
  const embeddings = await embedChunks(chunks);
  await prisma.noteChunk.deleteMany({ where: { noteId } });
  await prisma.noteChunk.createMany({
    data: chunks.map((content, i) => ({
      noteId,
      content,
      embedding: JSON.stringify(embeddings[i] ?? []),
      orderIdx: i,
    })),
  });
}

export async function retrieveRelevantChunks(userId: string, query: string, k: number = 6): Promise<string[]> {
  const queryEmbedding = await embedText(query);
  const chunks = await prisma.noteChunk.findMany({
    where: { note: { userId } },
    select: { content: true, embedding: true },
  });
  const withEmbedding = chunks.map((c) => ({
    content: c.content,
    embedding: JSON.parse(c.embedding) as number[],
  }));
  return topKBySimilarity(queryEmbedding, withEmbedding, k);
}
