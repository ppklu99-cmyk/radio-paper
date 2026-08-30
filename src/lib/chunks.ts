import { splitSentences } from "./text";
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
): SentenceChunk[] {
  const sentences = splitSentences(text);
  const totalChars = sentences.reduce((sum, sentence) => sum + sentence.length, 0);
  let cursor = 0;
  return sentences.map((sentence, i) => {
    const index = i + 1;
    const startTime = cursor;
    const share = totalChars === 0 ? 0 : sentence.length / totalChars;
    const endTime = i === sentences.length - 1 ? durationSec : cursor + share * durationSec;
    cursor = endTime;
    return {
      id: `${lessonId}-${index}`,
      lessonId,
      index,
      text: sentence,
      startTime,
      endTime,
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
  const mid = (target.startTime + target.endTime) / 2;
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
