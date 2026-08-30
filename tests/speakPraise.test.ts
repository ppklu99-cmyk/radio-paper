import { describe, expect, it } from "vitest";
import { pickEnglishFemaleVoice } from "../src/lib/speakPraise";

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
