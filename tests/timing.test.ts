import { describe, expect, it } from "vitest";
import { spokenWeight, allocateWindows, padWindows, snapToValleys } from "../src/lib/timing";

describe("spokenWeight", () => {
  it("gives longer spoken lines more weight than short ones", () => {
    expect(spokenWeight("Hi.")).toBeLessThan(spokenWeight("Officials said talks will continue through the weekend."));
  });

  it("is at least 1 for non-empty text", () => {
    expect(spokenWeight("I.")).toBeGreaterThanOrEqual(1);
  });
});

describe("allocateWindows", () => {
  it("covers the full duration in order", () => {
    const windows = allocateWindows([1, 3, 1], 10);
    expect(windows[0].start).toBe(0);
    expect(windows[2].end).toBe(10);
    expect(windows[0].end).toBeCloseTo(windows[1].start, 5);
    expect(windows[1].end - windows[1].start).toBeCloseTo(6, 5);
  });
});

describe("padWindows", () => {
  it("adds lead-in and tail without leaving the file", () => {
    const padded = padWindows(
      [
        { start: 0, end: 4 },
        { start: 4, end: 10 },
      ],
      10,
      0.3,
      0.4,
    );
    expect(padded[0].start).toBe(0);
    expect(padded[0].end).toBeCloseTo(4.4, 5);
    expect(padded[1].start).toBeCloseTo(3.7, 5);
    expect(padded[1].end).toBe(10);
  });
});

describe("snapToValleys", () => {
  it("moves a boundary to the nearest nearby silence", () => {
    const snapped = snapToValleys(
      [
        { start: 0, end: 4.2 },
        { start: 4.2, end: 10 },
      ],
      [4.0],
      1,
    );
    expect(snapped[0].end).toBeCloseTo(4.0, 5);
    expect(snapped[1].start).toBeCloseTo(4.0, 5);
  });
});
