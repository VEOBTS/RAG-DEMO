
"use client";
import { useState } from "react";
 
export default function UploadPage() {
  const [status, setStatus] = useState<string>("");
  const [url, setUrl] = useState("");
 
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("Uploading and processing...");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/documents/upload", { method: "POST", body: form });
    const data = await res.json();
    setStatus(res.ok ? `Done. ${data.chunkCount} chunks indexed.` : `Error: ${data.error}`);
  }
 
  async function handleUrl() {
    if (!url) return;
    setStatus("Fetching and processing website...");
    const res = await fetch("/api/documents/website", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    setStatus(res.ok ? `Done. ${data.chunkCount} chunks indexed.` : `Error: ${data.error}`);
  }
 
  return (
    <div className="max-w-xl mx-auto py-16 px-4 space-y-8">
      <h1 className="text-2xl font-semibold">Add to Knowledge Base</h1>
 
      <div className="border rounded-lg p-6 space-y-3">
        <p className="font-medium">Upload a PDF or Word document</p>
        <input type="file" accept=".pdf,.docx" onChange={handleFile} />
      </div>
 
      <div className="border rounded-lg p-6 space-y-3">
        <p className="font-medium">Or index a website</p>
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="https://example.com/docs"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="bg-black text-white rounded px-4 py-2" onClick={handleUrl}>
          Index website
        </button>
      </div>
 
      {status && <p className="text-sm text-gray-600">{status}</p>}
    </div>
  );
}
 