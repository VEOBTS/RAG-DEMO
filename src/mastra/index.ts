import { Mastra } from "@mastra/core";
import { QdrantVector } from "@mastra/qdrant";

export const vectorStore = new QdrantVector({
  id: "local-qdrant",
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY || undefined,
});

// Changed the default name so it forces a fresh collection
export const COLLECTION_NAME = process.env.QDRANT_COLLECTION || "gemini_kb";

export const mastra = new Mastra({
  vectors: { qdrant: vectorStore },
});

// Creates the Qdrant collection once, safe to call repeatedly.
export async function ensureCollection() {
  const existing = await vectorStore.listIndexes();
  if (!existing.includes(COLLECTION_NAME)) {
    await vectorStore.createIndex({
      indexName: COLLECTION_NAME,
      dimension: 768, // <-- Changed to 768 for Gemini!
      metric: "cosine",
    });
  }
}