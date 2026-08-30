import { describe, expect, it } from "vitest";
import { generateSyncCode, isValidSyncCode } from "../src/lib/syncCode";

const FORMAT = /^[A-Z]{3,6}-[2-9A-HJ-NP-Z]{2}-[A-Z]{3,6}$/;

describe("generateSyncCode", () => {
  it("matches WORD-2C-WORD and excludes 0O1IL", () => {
    for (let i = 0; i < 40; i++) {
      const code = generateSyncCode();
      expect(code).toMatch(FORMAT);
      const mid = code.split("-")[1];
      expect(mid).not.toMatch(/[0O1IL]/);
    }
  });
});

describe("isValidSyncCode", () => {
  it("accepts BLUE-4K-MINT and rejects BLUE-10-MINT", () => {
    expect(isValidSyncCode("BLUE-4K-MINT")).toBe(true);
    expect(isValidSyncCode("BLUE-10-MINT")).toBe(false);
  });
});
