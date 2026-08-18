export interface Chunk {
  text: string;
  pageNumber: number | null;
}
 
const CHUNK_SIZE = 800;     // characters per chunk
const CHUNK_OVERLAP = 150;  // characters shared between consecutive chunks
 
export function chunkText(text: string, pageNumber: number | null): Chunk[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
 
  const chunks: Chunk[] = [];
  let start = 0;
 
  while (start < clean.length) {
    const end = Math.min(start + CHUNK_SIZE, clean.length);
    let sliceEnd = end;
 
    // try to break on a sentence boundary instead of mid-word
    if (end < clean.length) {
      const lastPeriod = clean.lastIndexOf(". ", end);
      if (lastPeriod > start + CHUNK_SIZE * 0.5) {
        sliceEnd = lastPeriod + 1;
      }
    }
 
    const slice = clean.slice(start, sliceEnd).trim();
    if (slice) chunks.push({ text: slice, pageNumber });
 
    if (sliceEnd >= clean.length) break;
    start = sliceEnd - CHUNK_OVERLAP;
  }
 
  return chunks;
}
 
export function chunkPages(pages: { pageNumber: number | null; text: string }[]): Chunk[] {
  return pages.flatMap((p) => chunkText(p.text, p.pageNumber));
}
 
