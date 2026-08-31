import { splitSentences } from "./text";
import { allocateWindows, padWindows, snapToValleys, spokenWeight } from "./timing";
import type { SentenceChunk } from "./types";

function blankFields(now: number) {
  return {
    userInput: "",
    isCompleted: false,
    didShadow: false,
    updatedAt: now,
  };
}

export function buildChunks(
  lessonId: string,
  text: string,
  durationSec: number,
  now = Date.now(),
  silenceTimes: number[] = [],
): SentenceChunk[] {
  const sentences = splitSentences(text);
  const weights = sentences.map((sentence) => spokenWeight(sentence));
  let windows = allocateWindows(weights, durationSec);
  if (silenceTimes.length) windows = snapToValleys(windows, silenceTimes, 1.4);
  windows = padWindows(windows, durationSec);
  return sentences.map((sentence, i) => {
    const index = i + 1;
    const window = windows[i] ?? { start: 0, end: durationSec };
    return {
      id: `${lessonId}-${index}`,
      lessonId,
      index,
      text: sentence,
      startTime: window.start,
      endTime: window.end,
      ...blankFields(now),
    };
  });
}

function reindex(
  chunks: SentenceChunk[],
  now: number,
  idFor: (chunk: SentenceChunk, index: number) => string,
): SentenceChunk[] {
  return chunks.map((chunk, i) => {
    const index = i + 1;
    return {
      ...chunk,
      index,
      id: idFor(chunk, index),
      updatedAt: now,
    };
  });
}

export function mergeChunks(
  chunks: SentenceChunk[],
  leftIndex: number,
  now = Date.now(),
): SentenceChunk[] {
  const left = chunks[leftIndex];
  const right = chunks[leftIndex + 1];
  const merged: SentenceChunk = {
    ...left,
    text: `${left.text} ${right.text}`,
    endTime: right.endTime,
    userInput: [left.userInput, right.userInput].filter(Boolean).join(" "),
    isCompleted: left.isCompleted && right.isCompleted,
    updatedAt: now,
  };
  const next = [...chunks.slice(0, leftIndex), merged, ...chunks.slice(leftIndex + 2)];
  return reindex(next, now, (chunk, index) => `${chunk.lessonId}-${index}`);
}

export function splitChunk(
  chunks: SentenceChunk[],
  index: number,
  leftText: string,
  rightText: string,
  now = Date.now(),
): SentenceChunk[] {
  const target = chunks[index];
  const leftW = spokenWeight(leftText);
  const rightW = spokenWeight(rightText);
  const span = target.endTime - target.startTime;
  const mid =
    target.startTime + (span * leftW) / Math.max(leftW + rightW, 1);
  const shared = {
    lessonId: target.lessonId,
    ...blankFields(now),
  };
  const left: SentenceChunk = {
    ...shared,
    id: `${target.lessonId}-left`,
    index: 0,
    text: leftText,
    startTime: target.startTime,
    endTime: mid,
  };
  const right: SentenceChunk = {
    ...shared,
    id: `${target.lessonId}-right`,
    index: 0,
    text: rightText,
    startTime: mid,
    endTime: target.endTime,
  };
  const next = [...chunks.slice(0, index), left, right, ...chunks.slice(index + 1)];
  return reindex(next, now, (chunk, newIndex) => `${chunk.lessonId}-${newIndex}-${now}`);
}

export function isLongChunk(chunk: SentenceChunk): boolean {
  return chunk.endTime - chunk.startTime > 15;
}
