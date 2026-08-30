import { describe, expect, it } from "vitest";
import { SAMPLE_LESSON } from "../src/data/sampleLesson";
import { hydrateSample } from "../src/lib/hydrateSample";
import type { SyncDocument } from "../src/lib/types";

describe("hydrateSample", () => {
  it("upgrades the silent sample id and keeps completion", () => {
    const doc: SyncDocument = {
      syncCode: "BLUE-4K-MINT",
      lessons: [{ ...SAMPLE_LESSON, id: "sample-desk", durationSec: 90 }],
      chunks: [
        {
          id: "sample-desk-1",
          lessonId: "sample-desk",
          index: 1,
          text: "old",
          startTime: 0,
          endTime: 10,
          userInput: "welcome",
          isCompleted: true,
          didShadow: false,
          updatedAt: 9,
        },
      ],
      updatedAt: 9,
    };
    const next = hydrateSample(doc);
    expect(next.lessons[0].id).toBe("sample-desk-v2");
    expect(next.lessons[0].durationSec).toBe(18);
    expect(next.chunks[0].isCompleted).toBe(true);
    expect(next.chunks[0].userInput).toBe("welcome");
    expect(next.chunks[0].endTime).toBeLessThan(10);
  });
});
