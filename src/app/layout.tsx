import Link from "next/link";
import "./globals.css";

export const metadata = { title: "RAG Console", description: "AI Knowledge Base" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-text min-h-screen">
        <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg text-accent">RAG Console</Link>
          <div className="flex gap-4 text-sm">
            <Link href="/upload" className="text-text-muted hover:text-accent">Upload</Link>
            <Link href="/documents" className="text-text-muted hover:text-accent">Documents</Link>
            <Link href="/chat" className="text-text-muted hover:text-accent">Chat</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}