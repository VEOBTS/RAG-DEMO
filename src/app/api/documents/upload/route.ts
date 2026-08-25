import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { ingestDocument } from "@/lib/ingest";
 
export const runtime = "nodejs";
export const maxDuration = 300; // large PDFs take time to embed
 
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
 
  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
 
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext !== "pdf" && ext !== "docx") {
    return NextResponse.json({ error: "Only PDF and DOCX are supported." }, { status: 400 });
  }
  const mode = formData.get("mode") as string; // "add" | "replace"
  if (mode === "replace") {
    const { query } = await import("@/lib/db");
    const { deleteAllPoints } = await import("@/lib/qdrant-admin");
    const { COLLECTION_NAME, ensureCollection } = await import("@/mastra");
    await query(`TRUNCATE documents, chunks, conversations, messages`);
    await deleteAllPoints(COLLECTION_NAME);
    await ensureCollection();
  }
  const buffer = Buffer.from(await file.arrayBuffer());
 
  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, `${Date.now()}-${file.name}`);
  await writeFile(filePath, buffer);
 
  try {
    const result = await ingestDocument({
      title: file.name,
      sourceType: ext === "pdf" ? "pdf" : "docx",
      buffer,
      filePath,
    });
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}