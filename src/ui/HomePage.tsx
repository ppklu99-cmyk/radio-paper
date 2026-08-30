import type { Lesson, SentenceChunk } from "../lib/types";
import LessonCard from "./LessonCard";

type HomePageProps = {
  lesson: Lesson;
  chunks: SentenceChunk[];
  onOpenLesson: (lessonId: string) => void;
  onImport: () => void;
  onSettings: () => void;
};

export default function HomePage({
  lesson,
  chunks,
  onOpenLesson,
  onImport,
  onSettings,
}: HomePageProps) {
  return (
    <main className="page home">
      <div className="stack">
      <div className="home-row">
        <LessonCard lesson={lesson} chunks={chunks} onOpen={() => onOpenLesson(lesson.id)} />
        <div className="home-actions">
          <button type="button" className="quiet" onClick={onImport}>
            导入新的
          </button>
          <button type="button" className="quiet faint" onClick={onSettings}>
            设置
          </button>
        </div>
      </div>
      <p className="banner">
        手机平板用 Safari 打开 {__LAN_URL__}，再点分享 → 添加到主屏幕。
      </p>
      </div>
    </main>
  );
}
