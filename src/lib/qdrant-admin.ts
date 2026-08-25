const QDRANT_URL = process.env.QDRANT_URL!;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

function headers() {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (QDRANT_API_KEY) h["api-key"] = QDRANT_API_KEY;
  return h;
}

export async function deletePointsByIds(collection: string, ids: string[]) {
  if (ids.length === 0) return;
  await fetch(`${QDRANT_URL}/collections/${collection}/points/delete`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ points: ids }),
  });
}

export async function deleteAllPoints(collection: string) {
  await fetch(`${QDRANT_URL}/collections/${collection}`, {
    method: "DELETE",
    headers: headers(),
  });
}