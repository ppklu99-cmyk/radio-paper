import { describe, expect, it } from "vitest";
import { mergeDocuments } from "../src/lib/sync";
import type { SentenceChunk, SyncDocument } from "../src/lib/types";

function chunk(partial: Partial<SentenceChunk> & Pick<SentenceChunk, "id" | "updatedAt">): SentenceChunk {
  return {
    lessonId: "L",
    index: 1,
    text: "Hello.",
    startTime: 0,
    endTime: 2,
    userInput: "",
    isCompleted: false,
    didShadow: false,
    ...partial,
  };
}

function doc(partial: Partial<SyncDocument>): SyncDocument {
  return {
    syncCode: "BLUE-4K-MINT",
    lessons: [],
    chunks: [],
    updatedAt: 1,
    ...partial,
  };
}

describe("mergeDocuments", () => {
  it("keeps the newer chunk and reports a collision", () => {
    const local = doc({
      chunks: [chunk({ id: "a", userInput: "old", updatedAt: 1 })],
      updatedAt: 1,
    });
    const remote = doc({
      chunks: [chunk({ id: "a", userInput: "new", isCompleted: true, updatedAt: 2 })],
      updatedAt: 2,
    });
    const { doc: merged, collidedIds } = mergeDocuments(local, remote);
    expect(merged.chunks[0].userInput).toBe("new");
    expect(collidedIds).toContain("a");
  });
});
