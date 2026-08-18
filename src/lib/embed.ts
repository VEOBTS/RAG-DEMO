import { google } from "@ai-sdk/google";
import { embed, embedMany } from "ai";

const EMBEDDING_MODEL = google.textEmbeddingModel("text-embedding-004");

export async function embedOne(text: string): Promise<number[]> {
  const { embedding } = await embed({ model: EMBEDDING_MODEL, value: text });
  return embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({ model: EMBEDDING_MODEL, values: texts });
  return embeddings;
}