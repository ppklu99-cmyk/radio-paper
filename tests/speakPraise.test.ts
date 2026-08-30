import { describe, expect, it } from "vitest";
import { pickEnglishFemaleVoice, shapePraiseSpeech, splitPraisePhrases } from "../src/lib/speakPraise";

function voice(name: string, lang: string): SpeechSynthesisVoice {
  return { name, lang, default: false, localService: true, voiceURI: name } as SpeechSynthesisVoice;
}

describe("pickEnglishFemaleVoice", () => {
  it("prefers Samantha among English voices", () => {
    const chosen = pickEnglishFemaleVoice([
      voice("Google US English", "en-US"),
      voice("Samantha", "en-US"),
      voice("Alex", "en-US"),
    ]);
    expect(chosen?.name).toBe("Samantha");
  });

  it("does not pick a male English voice", () => {
    expect(
      pickEnglishFemaleVoice([voice("Daniel", "en-GB"), voice("Alex", "en-US")]),
    ).toBeNull();
  });

  it("uses a female Chinese voice rather than a male English one", () => {
    const chosen = pickEnglishFemaleVoice([
      voice("Tingting", "zh-CN"),
      voice("Daniel", "en-GB"),
    ]);
    expect(chosen?.name).toBe("Tingting");
  });
});

describe("splitPraisePhrases", () => {
  it("keeps a short line whole", () => {
    expect(splitPraisePhrases("That landed.")).toEqual(["That landed."]);
  });

  it("splits sentences and em dashes", () => {
    expect(splitPraisePhrases("You held the pace. I like that.")).toEqual([
      "You held the pace.",
      "I like that.",
    ]);
    expect(splitPraisePhrases("Noted — and well said.")).toEqual([
      "Noted",
      "and well said.",
    ]);
  });
});

describe("shapePraiseSpeech", () => {
  it("joins clauses with a spoken pause", () => {
    expect(shapePraiseSpeech("You held the pace. I like that.")).toBe(
      "You held the pace. … I like that.",
    );
  });
});
