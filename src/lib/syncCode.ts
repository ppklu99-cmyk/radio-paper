const WORDS = [
  "BLUE",
  "MINT",
  "SAGE",
  "CORAL",
  "AMBER",
  "PLUM",
  "TEAL",
  "ROSE",
  "GOLD",
  "SAND",
  "WAVE",
  "FERN",
] as const;

const MID_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickChar(): string {
  return MID_CHARS[Math.floor(Math.random() * MID_CHARS.length)];
}

export function generateSyncCode(): string {
  return `${pick(WORDS)}-${pickChar()}${pickChar()}-${pick(WORDS)}`;
}

export function isValidSyncCode(code: string): boolean {
  const parts = code.split("-");
  if (parts.length !== 3) return false;
  const [left, mid, right] = parts;
  if (!WORDS.includes(left as (typeof WORDS)[number])) return false;
  if (!WORDS.includes(right as (typeof WORDS)[number])) return false;
  if (mid.length !== 2) return false;
  return [...mid].every((ch) => MID_CHARS.includes(ch));
}
