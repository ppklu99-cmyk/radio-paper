export const BIONIC_MIN_WORDS = 8;

export type DiffToken = { word: string; tag: "ok" | "miss" | "wrong" };

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

export function diffWords(
  original: string,
  input: string,
): { tokens: DiffToken[]; extra: string[]; ratio: number } {
  const o = tokenize(original);
  const u = tokenize(input);
  let okCount = 0;
  const tokens: DiffToken[] = o.map((word, i) => {
    if (i >= u.length) return { word, tag: "miss" as const };
    if (u[i] === word) {
      okCount += 1;
      return { word, tag: "ok" as const };
    }
    return { word, tag: "wrong" as const };
  });
  return {
    tokens,
    extra: u.slice(o.length),
    ratio: o.length ? okCount / o.length : 0,
  };
}

export function firstLetterHint(text: string): string {
  return text
    .split(/\s+/)
    .map((word) => {
      const tailMatch = word.match(/[^\p{L}\p{N}]+$/u);
      const tail = tailMatch ? tailMatch[0] : "";
      const core = tail ? word.slice(0, -tail.length) : word;
      if (!core) return tail;
      return core[0] + "_".repeat(Math.max(0, core.length - 1)) + tail;
    })
    .join(" ");
}

export function bionicParts(word: string): { bold: string; rest: string } {
  const mid = Math.max(1, Math.ceil(word.length * 0.4));
  return { bold: word.slice(0, mid), rest: word.slice(mid) };
}

export function shouldAutoBionic(_text: string): boolean {
  return true;
}

const ABBREVIATIONS = ["Mrs.", "Ms.", "Mr.", "Dr.", "U.S.", "e.g.", "i.e."];

export function splitSentences(text: string): string[] {
  let protectedText = text;
  const placeholders = ABBREVIATIONS.map((abbr, i) => {
    const token = `\u0000ABBR${i}\u0000`;
    protectedText = protectedText.split(abbr).join(token);
    return { token, abbr };
  });

  return protectedText
    .split(/(?<=[.?!])\s+/)
    .map((sentence) => {
      let restored = sentence;
      for (const { token, abbr } of placeholders) {
        restored = restored.split(token).join(abbr);
      }
      return restored.trim();
    })
    .filter(Boolean);
}
