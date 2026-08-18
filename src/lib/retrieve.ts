import { vectorStore, COLLECTION_NAME } from "@/mastra";
import { embedOne } from "./embed";
import { query } from "./db";
 
export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  title: string;
  pageNumber: number | null;
  content: string;
  score: number;
}
 
export async function retrieveRelevantChunks(
  question: string,
  topK = 5
): Promise<RetrievedChunk[]> {
  const questionVector = await embedOne(question);
 
  const results = await vectorStore.query({
    indexName: COLLECTION_NAME,
    queryVector: questionVector,
    topK,
  });
 
  if (results.length === 0) return [];
 
  const vectorIds = results.map((r) => r.id);
  const rows = await query<{
    id: string; document_id: string; content: string; page_number: number | null; vector_id: string;
  }>(`SELECT id, document_id, content, page_number, vector_id FROM chunks WHERE vector_id = ANY($1)`, [vectorIds]);
 
  const docIds = [...new Set(rows.map((r) => r.document_id))];
  const docs = await query<{ id: string; title: string }>(
    `SELECT id, title FROM documents WHERE id = ANY($1)`, [docIds]
  );
  const titleById = Object.fromEntries(docs.map((d) => [d.id, d.title]));
 
  return results.map((r) => {
    const row = rows.find((x) => x.vector_id === r.id)!;
    return {
      chunkId: row.id,
      documentId: row.document_id,
      title: titleById[row.document_id],
      pageNumber: row.page_number,
      content: row.content,
      score: r.score,
    };
  });