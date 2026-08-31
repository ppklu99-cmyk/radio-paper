import { useMemo, useState } from "react";
import { buildChunks, isLongChunk, mergeChunks, splitChunk } from "../lib/chunks";
import { silenceTimesFromFile } from "../lib/silenceDetect";
import { splitSentences, tokenize } from "../lib/text";
import type { Lesson, SentenceChunk } from "../lib/types";

export type ImportCommit = {
  lesson: Lesson;
  chunks: SentenceChunk[];
  file: File;
};

type ImportPageProps = {
  onCommit: (payload: ImportCommit) => void;
  onBack: () => void;
};

function readDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const media = document.createElement(file.type.startsWith("video/") ? "video" : "audio");
    media.preload = "metadata";
    media.onloadedmetadata = () => {
      const duration = Number.isFinite(media.duration) ? media.duration : 60;
      URL.revokeObjectURL(url);
      resolve(duration);
    };
    media.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(60);
    };
    media.src = url;
  });
}

export default function ImportPage({ onCommit, onBack }: ImportPageProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [heavy, setHeavy] = useState(false);
  const [chunks, setChunks] = useState<SentenceChunk[]>([]);
  const [splitIndex, setSplitIndex] = useState<number | null>(null);
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");

  const canAdvanceText = useMemo(
    () => splitSentences(text).length > 0 && tokenize(text).length > 0,
    [text],
  );

  async function goPreview() {
    if (!file) return;
    if (!canAdvanceText) {
      setError("请粘贴英文原文");
      return;
    }
    setError("");
    const durationSec = await readDuration(file);
    const lessonId = `import-${Date.now()}`;
    const silenceTimes = await silenceTimesFromFile(file);
    setChunks(buildChunks(lessonId, text, durationSec, Date.now(), silenceTimes));
    setStep(3);
  }

  function confirm() {
    if (!file || chunks.length === 0) return;
    const title = file.name.replace(/\.[^.]+$/, "") || "未命名";
    const lesson: Lesson = {
      id: chunks[0].lessonId,
      title,
      durationSec: chunks[chunks.length - 1].endTime,
      mediaFileName: file.name,
      createdAt: Date.now(),
    };
    onCommit({ lesson, chunks, file });
  }

  return (
    <section className="import">
      <button type="button" className="quiet" onClick={onBack}>
        返回
      </button>
      <h1 className="page-title">导入新的</h1>

      {step === 1 ? (
        <>
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={(event) => {
              const next = event.target.files?.[0] ?? null;
              setFile(next);
              setHeavy(Boolean(next && next.size > 80 * 1024 * 1024));
            }}
          />
          <p className="import-hint">Safari 更稳的是 m4a / mp3 / mp4</p>
          {heavy ? <p className="import-hint">可能较卡</p> : null}
          <button type="button" className="solid" disabled={!file} onClick={() => setStep(2)}>
            下一步
          </button>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <textarea
            className="field"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="粘贴英文原文"
            aria-label="英文原文"
          />
          {error ? <p className="banner">{error}</p> : null}
          <div className="import-actions">
            <button type="button" className="quiet" onClick={() => setStep(1)}>
              上一步
            </button>
            <button type="button" className="solid" onClick={() => void goPreview()}>
              预览切片
            </button>
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <ul className="import-list">
            {chunks.map((chunk, index) => (
              <li key={chunk.id} className="import-item">
                <p className="import-item-text">{chunk.text}</p>
                <p className="import-hint">
                  约 {Math.max(1, Math.round(chunk.endTime - chunk.startTime))} 秒
                  {isLongChunk(chunk) ? " · 建议拆开" : ""}
                </p>
                <div className="actions">
                  {index < chunks.length - 1 ? (
                    <button
                      type="button"
                      className="quiet"
                      onClick={() => setChunks((prev) => mergeChunks(prev, index))}
                    >
                      与下一句合并
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="quiet"
                    onClick={() => {
                      setSplitIndex(index);
                      setLeftText(chunk.text);
                      setRightText("");
                    }}
                  >
                    拆开
                  </button>
                </div>
                {splitIndex === index ? (
                  <>
                    <textarea
                      className="field row-field"
                      value={leftText}
                      onChange={(event) => setLeftText(event.target.value)}
                    />
                    <textarea
                      className="field row-field"
                      value={rightText}
                      onChange={(event) => setRightText(event.target.value)}
                    />
                    <button
                      type="button"
                      className="solid"
                      disabled={!leftText.trim() || !rightText.trim()}
                      onClick={() => {
                        setChunks((prev) => splitChunk(prev, index, leftText.trim(), rightText.trim()));
                        setSplitIndex(null);
                      }}
                    >
                      确认拆开
                    </button>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
          <div className="import-actions">
            <button type="button" className="quiet" onClick={() => setStep(2)}>
              上一步
            </button>
            <button type="button" className="solid" onClick={confirm}>
              进入第一句
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
