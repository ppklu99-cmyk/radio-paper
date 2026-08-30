import { describe, expect, it } from "vitest";
import { builtinZh } from "../src/lib/translate";

describe("builtinZh", () => {
  it("covers the sample first sentence", () => {
    expect(builtinZh("Welcome to the midnight world desk.")).toBe("欢迎来到午夜世界台。");
  });
});
