import { useEffect, useMemo, useState } from "react";
import { SAMPLE_CHUNKS, SAMPLE_LESSON } from "./data/sampleLesson";
import { unlockAudio } from "./lib/audioUnlock";
import { mergeChunks, splitChunk } from "./lib/chunks";
import { getFile, loadLocal, rememberFile, saveLocal } from "./lib/db";
import { hydrateSample } from "./lib/hydrateSample";
import { shouldNudgeStop } from "./lib/sessionTimer";
import { pullAndMerge, push } from "./lib/sync";
import { generateSyncCode } from "./lib/syncCode";
import type { Lesson, SentenceChunk, SyncDocument } from "./lib/types";
import DictationPage from "./ui/DictationPage";
import HomePage from "./ui/HomePage";
import ImportPage from "./ui/ImportPage";
import SettingsPage from "./ui/SettingsPage";

type Screen = "home" | "dictation" | "import" | "settings";

const SESSION_MS = 8 * 60 * 1000;
const SAMPLE_SRC = `${import.meta.env.BASE_URL}sample/desk.wav`;

function nextOpenChunk(chunks: SentenceChunk[]): SentenceChunk | undefined {
  return chunks.find((chunk) => !chunk.isCompleted);
}

function sampleDoc(): SyncDocument {
  return {
    syncCode: generateSyncCode(),
    lessons: [SAMPLE_LESSON],
    chunks: SAMPLE_CHUNKS,
    updatedAt: Date.now(),
  };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [doc, setDoc] = useState<SyncDocument>(sampleDoc);
  const [ready, setReady] = useState(false);
  const [currentId, setCurrentId] = useState(SAMPLE_CHUNKS[0].id);
  const [revealed, setRevealed] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [banner, setBanner] = useState("");
  const [mediaUrl, setMediaUrl] = useState(SAMPLE_SRC);

  const lesson = doc.lessons[0] ?? SAMPLE_LESSON;
  const chunks = doc.chunks;
  const current = chunks.find((chunk) => chunk.id === currentId) ?? chunks[0];
  const elapsedMs = sessionStartedAt == null ? 0 : now - sessionStartedAt;
  const remainingMin = Math.max(0, Math.ceil((SESSION_MS - elapsedMs) / 60_000));
  const showNudge = sessionStartedAt != null && shouldNudgeStop(elapsedMs);

  const persist = useMemo(() => {
    return async (next: SyncDocument) => {
      setDoc(next);
      await saveLocal(next);
      try {
        await push(next);
      } catch {
        /* 没开同步服务时本地进度仍然保留 */
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const local = hydrateSample(await loadLocal());
        let next = local;
        try {
          const pulled = await pullAndMerge(local);
          next = hydrateSample(pulled.doc);
          if (pulled.collidedIds.length) setBanner("另一台刚刚也动过这句");
          await saveLocal(next);
        } catch {
          /* 同步服务未开时不挡学习 */
        }
        if (!cancelled) {
          setDoc(next);
          const open = nextOpenChunk(next.chunks) ?? next.chunks[0];
          if (open) setCurrentId(open.id);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (screen !== "dictation" || sessionStartedAt == null) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [screen, sessionStartedAt]);

  async function resolveMedia(nextLesson: Lesson) {
    if (nextLesson.id.startsWith("sample-desk")) {
      setMediaUrl(SAMPLE_SRC);
      return;
    }
    const file = await getFile(nextLesson.id);
    if (!file) {
      setMediaUrl("");
      return;
    }
    setMediaUrl(URL.createObjectURL(file));
  }

  function patchChunks(updater: (chunks: SentenceChunk[]) => SentenceChunk[]) {
    const next: SyncDocument = {
      ...doc,
      chunks: updater(doc.chunks),
      updatedAt: Date.now(),
    };
    void persist(next);
  }

  function replaceChunks(nextChunks: SentenceChunk[], stayAtIndex: number) {
    const next: SyncDocument = {
      ...doc,
      chunks: nextChunks,
      updatedAt: Date.now(),
    };
    void persist(next);
    const stay =
      nextChunks.find((chunk) => chunk.index === stayAtIndex) ?? nextChunks[0];
    if (stay) setCurrentId(stay.id);
    setRevealed(false);
  }

  function goHome() {
    setRevealed(false);
    setScreen("home");
  }

  async function openLesson() {
    await unlockAudio();
    const next = nextOpenChunk(chunks) ?? chunks[0];
    setCurrentId(next.id);
    setRevealed(false);
    setSessionStartedAt(Date.now());
    setNow(Date.now());
    await resolveMedia(lesson);
    setScreen("dictation");
  }

  if (!ready) {
    return <main className="page" />;
  }

  if (screen === "import") {
    return (
      <main className="page">
        <div className="stack">
          <ImportPage
            onBack={goHome}
            onCommit={async ({ lesson: nextLesson, chunks: nextChunks, file }) => {
              await rememberFile(nextLesson.id, file);
              const next: SyncDocument = {
                ...doc,
                lessons: [nextLesson],
                chunks: nextChunks,
                updatedAt: Date.now(),
              };
              await persist(next);
              setCurrentId(nextChunks[0].id);
              setRevealed(false);
              setSessionStartedAt(Date.now());
              setNow(Date.now());
              setMediaUrl(URL.createObjectURL(file));
              setScreen("dictation");
            }}
          />
        </div>
      </main>
    );
  }

  if (screen === "settings") {
    return (
      <main className="page">
        <div className="stack">
          {banner ? <p className="banner">{banner}</p> : null}
          <SettingsPage
            syncCode={doc.syncCode}
            onBack={goHome}
            onBind={(code) => {
              void persist({ ...doc, syncCode: code, updatedAt: Date.now() });
            }}
            onRegenerate={() => {
              void persist(sampleDoc());
            }}
          />
        </div>
      </main>
    );
  }

  if (screen === "dictation" && current) {
    return (
      <main className="page">
        <div className="stack">
          <div className="dictation-top">
            <button type="button" className="quiet" onClick={goHome}>
              返回
            </button>
            <p className="session-remain">约 {remainingMin} 分</p>
          </div>
          {banner ? <p className="banner">{banner}</p> : null}
          {showNudge ? (
            <p className="session-nudge banner" role="status">
              今天可以停了
            </p>
          ) : null}
          {mediaUrl ? (
            <DictationPage
              chunk={current}
              chunkCount={chunks.length}
              mediaSrc={mediaUrl}
              onInput={(value) =>
                patchChunks((prev) =>
                  prev.map((chunk) =>
                    chunk.id === current.id
                      ? { ...chunk, userInput: value, updatedAt: Date.now() }
                      : chunk,
                  ),
                )
              }
              onReveal={() => setRevealed(true)}
              revealed={revealed}
              onCheck={() =>
                patchChunks((prev) =>
                  prev.map((chunk) =>
                    chunk.id === current.id
                      ? { ...chunk, isCompleted: true, updatedAt: Date.now() }
                      : chunk,
                  ),
                )
              }
              onMore={() => {
                const open = chunks.find((chunk) => !chunk.isCompleted && chunk.id !== current.id);
                if (!open) {
                  goHome();
                  return;
                }
                setCurrentId(open.id);
                setRevealed(false);
              }}
              onStop={goHome}
              onShadowed={() =>
                patchChunks((prev) =>
                  prev.map((chunk) =>
                    chunk.id === current.id
                      ? { ...chunk, didShadow: true, updatedAt: Date.now() }
                      : chunk,
                  ),
                )
              }
              onReplayOriginal={() => undefined}
              onPrev={() => {
                const prev = chunks.find((item) => item.index === current.index - 1);
                if (!prev) return;
                setCurrentId(prev.id);
                setRevealed(false);
              }}
              onNext={() => {
                const next = chunks.find((item) => item.index === current.index + 1);
                if (!next) return;
                setCurrentId(next.id);
                setRevealed(false);
              }}
              onJump={(index) => {
                const target = chunks.find((item) => item.index === index);
                if (!target) return;
                setCurrentId(target.id);
                setRevealed(false);
              }}
              onMergePrev={() => {
                const leftIndex = current.index - 2;
                if (leftIndex < 0) return;
                replaceChunks(mergeChunks(chunks, leftIndex), leftIndex + 1);
              }}
              onMergeNext={() => {
                const leftIndex = current.index - 1;
                if (leftIndex < 0 || leftIndex >= chunks.length - 1) return;
                replaceChunks(mergeChunks(chunks, leftIndex), current.index);
              }}
              onSplit={(leftText, rightText) => {
                const index = current.index - 1;
                if (index < 0) return;
                replaceChunks(splitChunk(chunks, index, leftText, rightText), current.index);
              }}
            />
          ) : (
            <section className="dictation">
              <p className="banner">请在本机重新选择该文件</p>
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  void rememberFile(lesson.id, file).then(() => {
                    setMediaUrl(URL.createObjectURL(file));
                  });
                }}
              />
            </section>
          )}
        </div>
      </main>
    );
  }

  return (
    <HomePage
      lesson={lesson}
      chunks={chunks}
      onOpenLesson={() => {
        void openLesson();
      }}
      onImport={() => setScreen("import")}
      onSettings={() => setScreen("settings")}
    />
  );
}
