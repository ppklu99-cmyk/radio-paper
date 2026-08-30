const PREFERRED = [
  "Samantha",
  "Microsoft Zira",
  "Google UK English Female",
  "Karen",
  "Moira",
  "Tessa",
  "Serena",
];

function isEnglish(voice: SpeechSynthesisVoice): boolean {
  return /^en\b/i.test(voice.lang);
}

export function pickEnglishFemaleVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  const english = voices.filter(isEnglish);
  for (const name of PREFERRED) {
    const hit = english.find((voice) => voice.name.includes(name));
    if (hit) return hit;
  }
  const namedFemale = english.find((voice) => /female|zira|samantha|karen|moira/i.test(voice.name));
  return namedFemale ?? english[0] ?? null;
}

function pauseLessonMedia() {
  document.querySelectorAll<HTMLMediaElement>(".dictation-audio, .chunk-player-video").forEach((el) => {
    el.pause();
  });
}

function speakNow(text: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.92;
  utterance.pitch = 0.95;
  const voice = pickEnglishFemaleVoice(speechSynthesis.getVoices());
  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
}

export function speakPraise(text: string): void {
  if (typeof speechSynthesis === "undefined" || !text) return;
  pauseLessonMedia();
  speechSynthesis.cancel();
  speakNow(text);
  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.addEventListener(
      "voiceschanged",
      () => {
        speechSynthesis.cancel();
        speakNow(text);
      },
      { once: true },
    );
  }
}
