
# RAG Project — Quick Start

AI Knowledge Base: upload docs → chunk → embed (Gemini) → store (Qdrant + Postgres) → chat with citations.

## Stack
Next.js · Mastra · Qdrant · PostgreSQL · Gemini (`text-embedding-004` + `gemini-3.6-flash`)

## set-up guide 
Clone the repo, `npm install`, spin up Postgres + Qdrant with `docker compose up -d`, apply the schema using `docker exec -i rag-project-2-postgres-1 psql -U rag -d rag_db < db/schema.sql`, create `.env.local` with your Gemini key and DB/Qdrant URLs, then `npm run dev`. 

## Workflow (after setup)
Upload a doc at localhost:3000/upload → wait for "Done. N chunks indexed."
Verify it landed: docker exec -it rag-project-2-postgres-1 psql -U rag -d rag_db -c "SELECT title, status FROM documents;" → should show status = ready
Ask about it at localhost:3000/chat → answer shows with citation (source doc + page) underneath