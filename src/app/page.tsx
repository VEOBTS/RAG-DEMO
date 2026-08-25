import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-8">
      <h1 className="text-4xl font-bold">RAG Console</h1>
      <p className="text-neutral-400">
        Upload documents, build a knowledge base, and ask questions grounded in your own sources.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/upload" className="bg-white text-black rounded-lg px-6 py-3 font-medium">
          Add documents
        </Link>
        <Link href="/chat" className="border border-neutral-700 rounded-lg px-6 py-3 font-medium">
          Start chatting
        </Link>
      </div>
    </div>
  );
}