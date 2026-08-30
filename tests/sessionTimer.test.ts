import { expect, it } from "vitest";
import { shouldNudgeStop } from "../src/lib/sessionTimer";

it("nudges at 8 minutes not before", () => {
  expect(shouldNudgeStop(8 * 60 * 1000 - 1)).toBe(false);
  expect(shouldNudgeStop(8 * 60 * 1000)).toBe(true);
});
