const PREFERRED = [
  "Samantha",
  "Microsoft Zira",
  "Google UK English Female",
  "Karen",
  "Moira",
  "Tessa",
  "Serena",
  "Victoria",
  "Allison",
  "Ava",
  "Susan",
  "Flo",
];

const FEMALE_HINT = /female|zira|samantha|karen|moira|tessa|serena|victoria|allison|tingting|yaoyao|huihui|meijia|ting-ting|xiao/i;
const MALE_HINT = /male|alex|daniel|david|fred|tom\b|ralph|bruce|albert|aaron|james|mark|george/i;

function isEnglish(voice: SpeechSynthesisVoice): boolean {
  return /^en\b/i.test(voice.lang);
}

function isFemale(voice: SpeechSynthesisVoice): boolean {
  const label = `${voice.name} ${voice.voiceURI}`;
  if (MALE_HINT.test(label) && !FEMALE_HINT.test(label)) return false;
  return FEMALE_HINT.test(label);
}

export function pickEnglishFemaleVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  const english = voices.filter(isEnglish);
  for (const name of PREFERRED) {
    const hit = english.find((voice) => voice.name.includes(name));
    if (hit) return hit;
  }
  const englishFemale = english.find(isFemale);
  if (englishFemale) return englishFemale;
  return voices.find(isFemale) ?? null;
}

function pauseLessonMedia() {
  document.querySelectorAll<HTMLMediaElement>(".dictation-audio, .chunk-player-video").forEach((el) => {
    el.pause();
  });
}

function speakNow(text: string) {
  const voice = pickEnglishFemaleVoice(speechSynthesis.getVoices());
  if (!voice) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voice.lang.startsWith("zh") ? "en-US" : voice.lang;
  utterance.rate = 0.92;
  utterance.pitch = 1.05;
  utterance.voice = voice;
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
