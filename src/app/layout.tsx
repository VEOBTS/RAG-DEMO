import Link from "next/link";
import "./globals.css";

export const metadata = { title: "RAG Console", description: "AI Knowledge Base" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100 min-h-screen">
        <nav className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg">RAG Console</Link>
          <div className="flex gap-4 text-sm">
            <Link href="/upload" className="hover:text-blue-400">Upload</Link>
            <Link href="/documents" className="hover:text-blue-400">Documents</Link>
            <Link href="/chat" className="hover:text-blue-400">Chat</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}