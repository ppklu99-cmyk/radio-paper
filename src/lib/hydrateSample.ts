import { SAMPLE_CHUNKS, SAMPLE_LESSON } from "../data/sampleLesson";
import type { SyncDocument } from "./types";

export function hydrateSample(doc: SyncDocument): SyncDocument {
  const hasSample = doc.lessons.some((lesson) => lesson.id.startsWith("sample-desk"));
  if (!hasSample && doc.chunks.some((chunk) => chunk.lessonId.startsWith("sample-desk"))) {
    return replaceSample(doc);
  }
  if (!hasSample) return doc;
  return replaceSample(doc);
}

function replaceSample(doc: SyncDocument): SyncDocument {
  const mapped = SAMPLE_CHUNKS.map((fresh) => {
    const prev = doc.chunks.find(
      (chunk) => chunk.index === fresh.index && chunk.lessonId.startsWith("sample-desk"),
    );
    if (!prev) return fresh;
    return {
      ...fresh,
      userInput: prev.userInput,
      isCompleted: prev.isCompleted,
      didShadow: prev.didShadow,
      updatedAt: prev.updatedAt,
    };
  });
  return {
    ...doc,
    lessons: [SAMPLE_LESSON, ...doc.lessons.filter((lesson) => !lesson.id.startsWith("sample-desk"))],
    chunks: [
      ...mapped,
      ...doc.chunks.filter((chunk) => !chunk.lessonId.startsWith("sample-desk")),
    ],
  };
}
