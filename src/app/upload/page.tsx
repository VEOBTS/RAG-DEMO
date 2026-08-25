"use client";
import { useState } from "react";

export default function UploadPage() {
  const [status, setStatus] = useState<string>("");
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<"add" | "replace">("add");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("Uploading and processing...");
    const form = new FormData();
    form.append("file", file);
    form.append("mode", mode);
    try {
      const res = await fetch("/api/documents/upload", { method: "POST", body: form });
      const data = await res.json();
      setStatus(res.ok ? `Done. ${data.chunkCount} chunks indexed.` : `Error: ${data.error}`);
    } catch (err: any) {
      setStatus(`Failed: ${err.message}`);
    }
  }

  async function handleUrl() {
    if (!url) return;
    setStatus("Fetching and processing website...");
    const res = await fetch("/api/documents/website", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, mode }),
    });
    const data = await res.json();
    setStatus(res.ok ? `Done. ${data.chunkCount} chunks indexed.` : `Error: ${data.error}`);
  }

  return (
    <div className="max-w-xl mx-auto py-16 px-4 space-y-6 text-text">
      <h1 className="text-2xl font-semibold">Add to Knowledge Base</h1>

      <div className="flex gap-2 text-sm">
        <button
          onClick={() => setMode("add")}
          className={`px-3 py-1.5 rounded-full border border-border ${mode === "add" ? "bg-accent text-bg border-accent" : "text-text-muted"}`}
        >
          Add to existing
        </button>
        <button
          onClick={() => setMode("replace")}
          className={`px-3 py-1.5 rounded-full border border-border ${mode === "replace" ? "bg-accent text-bg border-accent" : "text-text-muted"}`}
        >
          Replace everything
        </button>
      </div>
      <p className="text-xs text-text-muted">
        {mode === "replace"
          ? "This clears the whole knowledge base before adding this document."
          : "This adds to whatever is already in the knowledge base."}
      </p>

      <div className="border border-border bg-surface rounded-lg p-6 space-y-3">
        <p className="font-medium">Upload a PDF or Word document</p>
        <input type="file" accept=".pdf,.docx" onChange={handleFile} />
      </div>

      <div className="border border-border bg-surface rounded-lg p-6 space-y-3">
        <p className="font-medium">Or index a website</p>
        <input
          className="bg-bg border border-border rounded px-3 py-2 w-full text-text"
          placeholder="https://example.com/docs"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="bg-accent text-bg rounded px-4 py-2 font-medium hover:bg-accent-hover" onClick={handleUrl}>
          Index website
        </button>
      </div>

      {status && <p className="text-sm text-text-muted">{status}</p>}
    </div>
  );
}