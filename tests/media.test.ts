import { describe, expect, it } from "vitest";
import { isVideoSrc, shouldSeekToStart } from "../src/lib/media";

describe("isVideoSrc", () => {
  it("is false for the sample desk.wav even on a full path", () => {
    expect(isVideoSrc("/sample/desk.wav")).toBe(false);
  });

  it("is true for mp4, webm, and mov", () => {
    expect(isVideoSrc("lesson.mp4")).toBe(true);
    expect(isVideoSrc("https://cdn.example/a.webm")).toBe(true);
    expect(isVideoSrc("clip.MOV")).toBe(true);
  });

  it("ignores query strings and hashes", () => {
    expect(isVideoSrc("talk.mp4?token=1")).toBe(true);
    expect(isVideoSrc("/files/note.wav#t=3")).toBe(false);
  });
});

describe("shouldSeekToStart", () => {
  it("seeks at endTime minus 0.05", () => {
    expect(shouldSeekToStart(9.95, 0, 10)).toBe(true);
    expect(shouldSeekToStart(9.94, 0, 10)).toBe(false);
  });

  it("seeks when currentTime is before startTime", () => {
    expect(shouldSeekToStart(1.9, 2, 5)).toBe(true);
  });

  it("does not seek inside the range", () => {
    expect(shouldSeekToStart(3, 2, 5)).toBe(false);
  });
});
