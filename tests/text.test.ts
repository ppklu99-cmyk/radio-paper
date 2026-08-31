import { describe, expect, it } from "vitest";
import { tokenize, diffWords, firstLetterHint, bionicParts, shouldAutoBionic, splitSentences, suggestSplit } from "../src/lib/text";

describe("tokenize", () => {
  it("lowercases and strips punctuation", () => {
    expect(tokenize("Hello, World!")).toEqual(["hello", "world"]);
  });
});

describe("diffWords", () => {
  it("is 1 when all words match ignoring case and punct", () => {
    expect(diffWords("Hello, world.", "hello world").ratio).toBe(1);
  });
  it("crosses 70% at 7 of 10", () => {
    const original = "one two three four five six seven eight nine ten";
    const input = "one two three four five six seven";
    expect(diffWords(original, input).ratio).toBe(0.7);
  });
  it("marks a miss when user stops early", () => {
    const d = diffWords("alpha beta", "alpha");
    expect(d.tokens.map((t) => t.tag)).toEqual(["ok", "miss"]);
  });
});

describe("firstLetterHint", () => {
  it("keeps first letter and trailing punct", () => {
    expect(firstLetterHint("Hello world.")).toBe("H____ w____.");
  });
});

describe("bionicParts", () => {
  it("bolds 40% rounded up, at least 1", () => {
    expect(bionicParts("Hello")).toEqual({ bold: "He", rest: "llo" });
    expect(bionicParts("I")).toEqual({ bold: "I", rest: "" });
  });
});

describe("shouldAutoBionic", () => {
  it("defaults on for any sentence", () => {
    expect(shouldAutoBionic("one")).toBe(true);
    expect(shouldAutoBionic("Welcome to the midnight world desk.")).toBe(true);
  });
});

describe("splitSentences", () => {
  it("splits on . ? ! and keeps Mr. together", () => {
    expect(splitSentences("Mr. Smith left. Did he? Yes!")).toEqual([
      "Mr. Smith left.",
      "Did he?",
      "Yes!",
    ]);
  });
});

describe("suggestSplit", () => {
  it("splits merged sentences on the first period", () => {
    expect(suggestSplit("Hi there. Next one.")).toEqual({
      left: "Hi there.",
      right: "Next one.",
    });
  });

  it("splits a single sentence at the middle word", () => {
    expect(suggestSplit("one two three four")).toEqual({
      left: "one two",
      right: "three four",
    });
  });

  it("returns null when there is only one word", () => {
    expect(suggestSplit("Hello.")).toBeNull();
  });
});
