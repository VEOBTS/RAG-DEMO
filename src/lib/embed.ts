import { google } from "@ai-sdk/google";
import { embed, embedMany } from "ai";

const EMBEDDING_MODEL = google.embedding("gemini-embedding-001");
const PROVIDER_OPTIONS = { google: { outputDimensionality: 768 } };

export async function embedOne(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    value: text,
    providerOptions: PROVIDER_OPTIONS,
  });
  return embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: EMBEDDING_MODEL,
    values: texts,
    providerOptions: PROVIDER_OPTIONS,
  });
  return embeddings;
}