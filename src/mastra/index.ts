import { Mastra } from "@mastra/core";
import { QdrantVector } from "@mastra/qdrant";

export const vectorStore = new QdrantVector({
  id: "knowledge-base-store",
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY || undefined,
});

export const COLLECTION_NAME = process.env.QDRANT_COLLECTION || "knowledge_base";

export const mastra = new Mastra({
  vectors: { qdrant: vectorStore },
});

// Creates the Qdrant collection once, safe to call repeatedly.
export async function ensureCollection() {
  const existing = await vectorStore.listIndexes();
  if (!existing.includes(COLLECTION_NAME)) {
    await vectorStore.createIndex({
      indexName: COLLECTION_NAME,
      dimension: 768, // matches Gemini text-embedding-004
      metric: "cosine",
    });
  }
}