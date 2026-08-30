import type { SentenceChunk, SyncDocument } from "./types";

export function mergeDocuments(
  local: SyncDocument,
  remote: SyncDocument,
): { doc: SyncDocument; collidedIds: string[] } {
  const byId = new Map<string, SentenceChunk>();
  const collidedIds: string[] = [];

  for (const chunk of local.chunks) byId.set(chunk.id, chunk);
  for (const chunk of remote.chunks) {
    const existing = byId.get(chunk.id);
    if (!existing) {
      byId.set(chunk.id, chunk);
      continue;
    }
    if (chunk.updatedAt === existing.updatedAt) {
      byId.set(chunk.id, chunk);
      continue;
    }
    if (chunk.updatedAt > existing.updatedAt) {
      if (
        chunk.userInput !== existing.userInput ||
        chunk.isCompleted !== existing.isCompleted
      ) {
        collidedIds.push(chunk.id);
      }
      byId.set(chunk.id, chunk);
    } else if (
      existing.userInput !== chunk.userInput ||
      existing.isCompleted !== chunk.isCompleted
    ) {
      collidedIds.push(existing.id);
    }
  }

  const newer = remote.updatedAt >= local.updatedAt ? remote : local;
  const doc: SyncDocument = {
    syncCode: newer.syncCode,
    lessons: newer.lessons,
    chunks: [...byId.values()].sort((a, b) => a.index - b.index),
    updatedAt: Math.max(local.updatedAt, remote.updatedAt),
  };
  return { doc, collidedIds };
}

export async function pullAndMerge(
  local: SyncDocument,
): Promise<{ doc: SyncDocument; collidedIds: string[] }> {
  const response = await fetch(`/sync/${encodeURIComponent(local.syncCode)}`);
  if (response.status === 404) return { doc: local, collidedIds: [] };
  if (!response.ok) throw new Error("pull failed");
  const remote = (await response.json()) as SyncDocument;
  return mergeDocuments(local, remote);
}

export async function push(doc: SyncDocument): Promise<void> {
  const response = await fetch(`/sync/${encodeURIComponent(doc.syncCode)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(doc),
  });
  if (!response.ok) throw new Error("push failed");
}
