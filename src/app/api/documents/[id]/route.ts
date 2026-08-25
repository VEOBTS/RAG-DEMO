import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { deletePointsByIds } from "@/lib/qdrant-admin";
import { COLLECTION_NAME } from "@/mastra";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const chunks = await query<{ vector_id: string }>(
    `SELECT vector_id FROM chunks WHERE document_id = $1`,
    [params.id]
  );
  await deletePointsByIds(COLLECTION_NAME, chunks.map((c) => c.vector_id));
  await query(`DELETE FROM documents WHERE id = $1`, [params.id]);
  return NextResponse.json({ success: true });
}