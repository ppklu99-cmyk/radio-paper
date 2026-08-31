export const LEAD_SEC = 0.32;
export const TAIL_SEC = 0.48;

export function syllableCount(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 1;
  const groups = w.match(/[aeiouy]+/g);
  let n = groups?.length ?? 1;
  if (w.length > 2 && w.endsWith("e") && n > 1) n -= 1;
  return Math.max(1, n);
}

export function spokenWeight(text: string): number {
  const words = text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
  if (words.length === 0) return 1;
  const spoken = words.reduce((sum, word) => sum + syllableCount(word), 0);
  const pause = /[.?!]["')\]]*$/.test(text.trim()) ? 0.45 : 0;
  return spoken + pause;
}

export type TimeWindow = { start: number; end: number };

export function allocateWindows(weights: number[], durationSec: number): TimeWindow[] {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let cursor = 0;
  return weights.map((weight, i) => {
    const start = cursor;
    const end = i === weights.length - 1 || total === 0 ? durationSec : cursor + (weight / total) * durationSec;
    cursor = end;
    return { start, end };
  });
}

export function padWindows(
  windows: TimeWindow[],
  durationSec: number,
  lead = LEAD_SEC,
  tail = TAIL_SEC,
): TimeWindow[] {
  return windows.map((window, i) => {
    const start = i === 0 ? 0 : Math.max(0, window.start - lead);
    const end = i === windows.length - 1 ? durationSec : Math.min(durationSec, window.end + tail);
    return { start, end: Math.max(start + 0.4, end) };
  });
}

export function snapToValleys(
  windows: TimeWindow[],
  valleys: number[],
  maxShift: number,
): TimeWindow[] {
  if (windows.length < 2 || valleys.length === 0) return windows.map((window) => ({ ...window }));
  const next = windows.map((window) => ({ ...window }));
  for (let i = 0; i < next.length - 1; i += 1) {
    const edge = next[i].end;
    let best = edge;
    let bestDist = maxShift;
    for (const valley of valleys) {
      const dist = Math.abs(valley - edge);
      if (dist <= bestDist) {
        bestDist = dist;
        best = valley;
      }
    }
    if (best <= next[i].start + 0.5 || best >= next[i + 1].end - 0.5) continue;
    next[i].end = best;
    next[i + 1].start = best;
  }
  next[0].start = 0;
  next[next.length - 1].end = windows[windows.length - 1].end;
  return next;
}

export function rmsHops(channel: Float32Array, hopSamples: number): number[] {
  const hops: number[] = [];
  for (let i = 0; i + hopSamples <= channel.length; i += hopSamples) {
    let sum = 0;
    for (let j = 0; j < hopSamples; j += 1) {
      const s = channel[i + j] ?? 0;
      sum += s * s;
    }
    hops.push(Math.sqrt(sum / hopSamples));
  }
  return hops;
}

export function findSilenceTimes(hopRms: number[], hopSec: number): number[] {
  if (hopRms.length === 0) return [];
  const ranked = [...hopRms].sort((a, b) => a - b);
  const median = ranked[Math.floor(ranked.length / 2)] ?? 0;
  const thresh = Math.max(median * 0.3, 0.01);
  const times: number[] = [];
  let run = 0;
  let runStart = 0;
  const flush = (end: number) => {
    if (run >= 2) times.push(((runStart + end) / 2) * hopSec);
    run = 0;
  };
  for (let i = 0; i < hopRms.length; i += 1) {
    if ((hopRms[i] ?? 0) < thresh) {
      if (run === 0) runStart = i;
      run += 1;
    } else {
      flush(i);
    }
  }
  flush(hopRms.length);
  return times;
}
