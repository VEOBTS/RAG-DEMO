"use client";
import { useState } from "react";
 
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
    <div className="max-w-2xl mx-auto py-10 px-4 flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className={`inline-block rounded-lg px-4 py-2 ${m.role === "user" ? "bg-black text-white" : "bg-gray-100"}`}>
              {m.content}
            </div>
            {m.citations && m.citations.length > 0 && (
              <div className="mt-1 text-xs text-gray-500 space-x-2">
                {m.citations.map((c) => (
                  <span key={c.marker}>
                    [{c.marker}] {c.title}{c.pageNumber ? `, p.${c.pageNumber}` : ""}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <p className="text-sm text-gray-400">Thinking...</p>}
      </div>
 
      <div className="flex gap-2 pt-4 border-t">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask a question about your documents..."
        />
        <button className="bg-black text-white rounded px-4 py-2" onClick={send}>Send</button>
      </div>
    </div>
  );
}