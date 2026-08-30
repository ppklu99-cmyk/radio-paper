import { describe, expect, it } from "vitest";
import { pickPraise, AFTER_SHADOW, MESSY, STOP } from "../src/lib/praise";

describe("praise banks", () => {
  it("exports spec section 8 lists unchanged", () => {
    expect(AFTER_SHADOW).toEqual([
      "We\u2019ll take that.",
      "That\u2019s on the air.",
      "Clean enough to broadcast.",
      "You held the pace. I like that.",
      "The room heard you.",
      "That\u2019s a voice I would keep.",
      "You didn\u2019t flinch. Good.",
      "Noted \u2014 and well said.",
      "That landed.",
      "Keep that colour in your voice.",
      "You sounded sure. Stay there.",
      "I\u2019d run that again as-is.",
      "Quiet confidence. That\u2019s the one.",
      "You made the sentence behave.",
      "That\u2019s the cut. Print it.",
    ]);
    expect(MESSY).toEqual([
      "You started. That\u2019s the hard part.",
      "Messy is still a take.",
      "You showed up. I heard you.",
      "Not perfect. Still yours.",
      "Come back tomorrow with the same nerve.",
    ]);
    expect(STOP).toEqual([
      "One more if you want it. You\u2019re allowed to stop.",
      "That\u2019s a full day\u2019s work, if you say so.",
      "Leave on a good take.",
    ]);
  });
});

describe("pickPraise", () => {
  it("returns a line from the matching bank", () => {
    expect(AFTER_SHADOW).toContain(pickPraise("afterShadow"));
    expect(MESSY).toContain(pickPraise("messy"));
    expect(STOP).toContain(pickPraise("stop"));
  });

  it("avoids repeating last when the bank has more than one line", () => {
    const last = AFTER_SHADOW[0];
    expect(AFTER_SHADOW.length).toBeGreaterThan(1);
    expect(pickPraise("afterShadow", last)).not.toBe(last);
  });
});
