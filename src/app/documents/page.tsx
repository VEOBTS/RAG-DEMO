"use client";
import { useEffect, useState } from "react";

interface Doc { id: string; title: string; status: string; chunk_count: number; created_at: string; }

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/documents");
    const data = await res.json();
    setDocs(data.documents);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function deleteOne(id: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    load();
  }

  async function clearAll() {
    if (!confirm("This wipes the ENTIRE knowledge base. Continue?")) return;
    await fetch("/api/documents", { method: "DELETE" });
    load();
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 text-text">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Knowledge Base</h1>
        {docs.length > 0 && (
          <button onClick={clearAll} className="text-sm text-red-500 hover:underline">
            Clear all
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-text-muted">Loading...</p>}
      {!loading && docs.length === 0 && (
        <p className="text-sm text-text-muted">No documents yet. Go upload one.</p>
      )}

      <div className="space-y-2">
        {docs.map((d) => (
          <div key={d.id} className="flex justify-between items-center border border-border bg-surface rounded-lg px-4 py-3">
            <div>
              <p className="font-medium">{d.title}</p>
              <p className="text-xs text-text-muted">
                {d.status} · {d.chunk_count} chunks · {new Date(d.created_at).toLocaleDateString()}
              </p>
            </div>
            <button onClick={() => deleteOne(d.id)} className="text-sm text-red-500 hover:underline">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}