import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import * as cheerio from "cheerio";

export interface ExtractedPage {
  pageNumber: number | null;
  text: string;
}

export async function extractFromPdf(buffer: Buffer): Promise<ExtractedPage[]> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();

  return result.pages.map((p) => ({
    pageNumber: p.num,
    text: p.text,
  }));
}

export async function extractFromDocx(buffer: Buffer): Promise<ExtractedPage[]> {
  const { value } = await mammoth.extractRawText({ buffer });
  return [{ pageNumber: null, text: value }];
}

export async function extractFromWebsite(url: string): Promise<ExtractedPage[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim();
  return [{ pageNumber: null, text }];
}