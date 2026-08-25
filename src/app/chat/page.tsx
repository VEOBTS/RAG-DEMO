"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Citation { marker: number; title: string; pageNumber: number | null; }
interface Message { role: "user" | "assistant"; content: string; citations?: Citation[]; }

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, message: userMsg.content }),
    });
    const data = await res.json();
    setConversationId(data.conversationId);
    setMessages((m) => [...m, { role: "assistant", content: data.answer, citations: data.citations }]);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col h-[calc(100vh-65px)] text-text">
      <div className="flex-1 overflow-y-auto space-y-6 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                m.role === "user" ? "bg-accent text-bg" : "bg-surface border border-border"
              }`}
            >
              <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
              </div>

              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border space-y-1">
                  <p className="text-xs uppercase tracking-wide text-text-muted">Sources</p>
                  {m.citations.map((c) => (
                    <div key={c.marker} className="text-xs text-text-muted flex gap-2">
                      <span className="text-accent">[{c.marker}]</span>
                      <span>{c.title}{c.pageNumber ? `, p.${c.pageNumber}` : ""}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <p className="text-sm text-text-muted">Thinking...</p>}
      </div>

      <div className="flex gap-2 pt-4 border-t border-border">
        <input
          className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask a question about your documents..."
        />
        <button className="bg-accent text-bg rounded-lg px-4 py-2 font-medium hover:bg-accent-hover" onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}