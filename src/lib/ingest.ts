import { v4 as uuidv4 } from "uuid";
import { query } from "./db";
import { extractFromPdf, extractFromDocx, extractFromWebsite } from "./extract";
import { chunkPages } from "./chunk";
import { embedBatch } from "./embed";
import { vectorStore, COLLECTION_NAME, ensureCollection } from "@/mastra";

export type SourceType = "pdf" | "docx" | "website";

interface IngestInput {
  title: string;
  sourceType: SourceType;
  buffer?: Buffer;
  url?: string;
  filePath?: string;
}

export async function ingestDocument(input: IngestInput) {
  await ensureCollection();

  const [doc] = await query<{ id: string }>(
    `INSERT INTO documents (title, source_type, source_url, file_path, status)
     VALUES ($1, $2, $3, $4, 'processing') RETURNING id`,
    [input.title, input.sourceType, input.url ?? null, input.filePath ?? null]
  );
  const documentId = doc.id;

  try {
    let pages;
    if (input.sourceType === "pdf") pages = await extractFromPdf(input.buffer!);
    else if (input.sourceType === "docx") pages = await extractFromDocx(input.buffer!);
    else pages = await extractFromWebsite(input.url!);

    const chunks = chunkPages(pages);
    if (chunks.length === 0) throw new Error("No extractable text found in source.");

    const BATCH = 50;
    for (let i = 0; i < chunks.length; i += BATCH) {
      const batch = chunks.slice(i, i + BATCH);
      const vectors = await embedBatch(batch.map((c) => c.text));

      const points = batch.map((c, j) => ({
        id: uuidv4(),
        vector: vectors[j],
        payload: { documentId, title: input.title, pageNumber: c.pageNumber },
      }));

      await vectorStore.upsert({
        indexName: COLLECTION_NAME,
        vectors: points.map((p) => p.vector),
        ids: points.map((p) => p.id),
        metadata: points.map((p) => p.payload),
      });

      for (let j = 0; j < batch.length; j++) {
        await query(
          `INSERT INTO chunks (document_id, content, chunk_index, page_number, vector_id)
           VALUES ($1, $2, $3, $4, $5)`,
          [documentId, batch[j].text, i + j, batch[j].pageNumber, points[j].id]
        );
      }
    }

    await query(`UPDATE documents SET status = 'ready' WHERE id = $1`, [documentId]);
    return { documentId, chunkCount: chunks.length };
  } catch (err: any) {
    await query(
      `UPDATE documents SET status = 'failed', error_message = $2 WHERE id = $1`,
      [documentId, String(err.message ?? err)]
    );
    throw err;
  }
}