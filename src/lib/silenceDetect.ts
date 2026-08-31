import { findSilenceTimes, rmsHops } from "./timing";

export async function silenceTimesFromFile(file: File): Promise<number[]> {
  const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return [];
  const ctx = new AudioCtx();
  try {
    const buffer = await ctx.decodeAudioData(await file.arrayBuffer());
    const channel = buffer.getChannelData(0);
    const hopSamples = Math.max(1, Math.round(buffer.sampleRate * 0.02));
    return findSilenceTimes(rmsHops(channel, hopSamples), hopSamples / buffer.sampleRate);
  } catch {
    return [];
  } finally {
    void ctx.close();
  }
}
