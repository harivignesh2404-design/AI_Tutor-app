import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
export const openai = apiKey ? new OpenAI({ apiKey }) : null;

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const CHAT_MODEL = "gpt-4o-mini";

export async function embedText(text: string): Promise<number[]> {
  if (!openai) throw new Error("OPENAI_API_KEY is not set");
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000),
  });
  return res.data[0].embedding;
}

export async function embedChunks(texts: string[]): Promise<number[][]> {
  if (!openai || texts.length === 0) return [];
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts.map((t) => t.slice(0, 8000)),
  });
  return res.data.sort((a, b) => (a.index ?? 0) - (b.index ?? 0)).map((d) => d.embedding);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function topKBySimilarity(queryEmbedding: number[], chunkEmbeddings: { embedding: number[]; content: string }[], k: number) {
  const scored = chunkEmbeddings.map((c) => ({
    ...c,
    score: cosineSimilarity(queryEmbedding, c.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map((c) => c.content);
}
