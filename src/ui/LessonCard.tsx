import type { Lesson, SentenceChunk } from "../lib/types";

type LessonCardProps = {
  lesson: Lesson;
  chunks: SentenceChunk[];
  onOpen: () => void;
};

function nextSentenceIndex(chunks: SentenceChunk[]): number {
  const firstOpen = chunks.find((chunk) => !chunk.isCompleted);
  return firstOpen ? firstOpen.index : chunks.length;
}

export default function LessonCard({ lesson, chunks, onOpen }: LessonCardProps) {
  const total = chunks.length;
  const current = nextSentenceIndex(chunks);
  const minutes = Math.max(1, Math.round(lesson.durationSec / 60));

  return (
    <button type="button" className="lesson-card" onClick={onOpen}>
      <span className="lesson-card-title">{lesson.title}</span>
      <span className="lesson-card-meta">约 {minutes} 分钟</span>
      <span className="lesson-card-progress">
        第 {current} / {total} 句
      </span>
    </button>
  );
}
