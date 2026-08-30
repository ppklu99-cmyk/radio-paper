import { describe, expect, it } from "vitest";
import { buildChunks, mergeChunks, splitChunk, isLongChunk } from "../src/lib/chunks";

describe("buildChunks", () => {
  it("allocates time by character share", () => {
    const chunks = buildChunks("L1", "Hi. Hello there.", 10, 0);
    expect(chunks).toHaveLength(2);
    expect(chunks[0].startTime).toBe(0);
    expect(chunks[0].endTime + chunks[1].endTime - chunks[1].startTime).toBeCloseTo(10, 5);
    expect(chunks[1].endTime).toBe(10);
    expect(chunks[0].index).toBe(1);
    expect(chunks[1].index).toBe(2);
    expect(chunks[0].userInput).toBe("");
    expect(chunks[0].isCompleted).toBe(false);
    expect(chunks[0].didShadow).toBe(false);
  });
});

describe("mergeChunks", () => {
  it("merges neighbors and reindexes from 1", () => {
    const chunks = buildChunks("L1", "A. B. C.", 9, 0);
    const merged = mergeChunks(chunks, 0, 1);
    expect(merged).toHaveLength(2);
    expect(merged[0].text).toMatch(/A\./);
    expect(merged[0].index).toBe(1);
    expect(merged[1].index).toBe(2);
  });
});

describe("splitChunk", () => {
  it("splits one sentence into two and reindexes", () => {
    const chunks = buildChunks("L1", "Hello world now.", 10, 0);
    const split = splitChunk(chunks, 0, "Hello", "world now.", 1);
    expect(split).toHaveLength(2);
    expect(split[0].text).toBe("Hello");
    expect(split[1].text).toBe("world now.");
    expect(split[0].index).toBe(1);
    expect(split[1].index).toBe(2);
    expect(split[0].endTime).toBeCloseTo(5, 5);
    expect(split[1].startTime).toBeCloseTo(5, 5);
    expect(split[1].endTime).toBe(10);
    expect(split[0].userInput).toBe("");
    expect(split[0].isCompleted).toBe(false);
    expect(split[0].didShadow).toBe(false);
  });
});

describe("isLongChunk", () => {
  it("flags chunks longer than 15s", () => {
    const [c] = buildChunks("L1", "Only one sentence here.", 20, 0);
    expect(isLongChunk(c)).toBe(true);
  });
});
