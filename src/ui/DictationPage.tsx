import { useEffect, useState } from "react";
import { isVideoSrc } from "../lib/media";
import { pickPraise } from "../lib/praise";
import { speakPraise } from "../lib/speakPraise";
import { diffWords, firstLetterHint, shouldAutoBionic } from "../lib/text";
import { translateSentence } from "../lib/translate";
import type { SentenceChunk } from "../lib/types";
import BionicText from "./BionicText";
import ChunkPlayer from "./ChunkPlayer";
import HandCheck from "./HandCheck";
import ShadowPanel from "./ShadowPanel";

export type DictationPageProps = {
  chunk: SentenceChunk;
  chunkCount: number;
  mediaSrc: string;
  onInput: (value: string) => void;
  onReveal: () => void;
  revealed: boolean;
  onCheck: () => void;
  onMore: () => void;
  onStop: () => void;
  onShadowed: () => void;
  onReplayOriginal: () => void;
  onPrev: () => void;
  onNext: () => void;
  onJump: (index: number) => void;
};

export default function DictationPage({
  chunk,
  chunkCount,
  onInput,
  onReveal,
  revealed,
  onCheck,
  onMore,
  onStop,
  mediaSrc,
  onShadowed,
  onReplayOriginal,
  onPrev,
  onNext,
  onJump,
}: DictationPageProps) {
  const phase: "listen" | "check" = revealed ? "check" : "listen";
  const [showHint, setShowHint] = useState(true);
  const [bionicOn, setBionicOn] = useState(true);
  const [wide, setWide] = useState(
    () => window.matchMedia("(min-width: 768px)").matches,
  );
  const [videoHidden, setVideoHidden] = useState(false);
  const [replayNonce, setReplayNonce] = useState(0);
  const [zh, setZh] = useState("");
  const [zhError, setZhError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showZh, setShowZh] = useState(false);
  const [stopPraise, setStopPraise] = useState<string | null>(null);
  const showVideo = wide && isVideoSrc(mediaSrc) && !videoHidden;
  const atFirst = chunk.index <= 1;
  const atLast = chunk.index >= chunkCount;
  const showMilestoneCheck = chunk.index % 5 === 0;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setShowHint(true);
    setBionicOn(shouldAutoBionic(chunk.text));
    setCopied(false);
    setShowZh(false);
    setZh("");
    setZhError("");
    let cancelled = false;
    void translateSentence(chunk.text)
      .then((text) => {
        if (!cancelled) setZh(text);
      })
      .catch(() => {
        if (!cancelled) setZhError("翻译暂时不可用");
      });
    return () => {
      cancelled = true;
    };
  }, [chunk.id, chunk.text]);

  const diff = diffWords(chunk.text, chunk.userInput);

  async function copySentence() {
    try {
      await navigator.clipboard.writeText(chunk.text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className={showVideo ? "dictation has-video" : "dictation"}>
      <div className="sentence-nav">
        <button type="button" className="quiet nav-glyph" disabled={atFirst} onClick={onPrev} aria-label="上一句">
          &lt;
        </button>
        <label className="sentence-jump">
          <select
            value={chunk.index}
            aria-label="第几句"
            onChange={(event) => onJump(Number(event.target.value))}
          >
            {Array.from({ length: chunkCount }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          / {chunkCount}
        </label>
        <button type="button" className="quiet nav-glyph" disabled={atLast} onClick={onNext} aria-label="下一句">
          &gt;
        </button>
        <button type="button" className="quiet nav-glyph" onClick={() => void copySentence()} aria-label="复制这句">
          {copied ? "✓" : "⎘"}
        </button>
      </div>

      <ChunkPlayer
        src={mediaSrc}
        startTime={chunk.startTime}
        endTime={chunk.endTime}
        showVideo={showVideo}
        onHideVideo={() => setVideoHidden(true)}
        replayNonce={replayNonce}
      />

      {phase === "listen" ? (
        <>
          {showHint ? (
            <p className="english dictation-hint">{firstLetterHint(chunk.text)}</p>
          ) : null}
          <label className="dictation-switch">
            <input
              type="checkbox"
              checked={showHint}
              onChange={(event) => setShowHint(event.target.checked)}
            />
            首字母
          </label>
        </>
      ) : (
        <>
          <p className="english dictation-diff">
            {diff.tokens.map((token, i) => (
              <span key={`${token.word}-${i}`} className={`diff-${token.tag}`}>
                {i > 0 ? " " : null}
                {token.word}
              </span>
            ))}
          </p>
          {bionicOn ? (
            <BionicText text={chunk.text} />
          ) : (
            <p className="english dictation-original">{chunk.text}</p>
          )}
          <label className="dictation-switch">
            <input
              type="checkbox"
              checked={bionicOn}
              onChange={(event) => setBionicOn(event.target.checked)}
            />
            仿生阅读
          </label>
          <ShadowPanel
            ratio={diff.ratio}
            onShadowed={onShadowed}
            onReplayOriginal={() => {
              setReplayNonce((n) => n + 1);
              onReplayOriginal();
            }}
          />
        </>
      )}

      <div className="zh-row">
        <button
          type="button"
          className="quiet"
          onClick={() => setShowZh((on) => !on)}
          aria-label={showZh ? "隐藏翻译" : "显示翻译"}
        >
          译
        </button>
        {showZh && zh ? <p className="sentence-zh">{zh}</p> : null}
        {showZh && zhError ? <p className="banner">{zhError}</p> : null}
      </div>

      <textarea
        className="dictation-input"
        value={chunk.userInput}
        onChange={(event) => onInput(event.target.value)}
        autoFocus
        rows={4}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-label="听写输入"
      />

      {phase === "listen" ? (
        <button
          type="button"
          className="solid"
          onClick={() => {
            setShowZh(true);
            onReveal();
          }}
        >
          核对
        </button>
      ) : null}

      {showMilestoneCheck ? (
        <div className="milestone-check">
          <HandCheck
            checked={chunk.isCompleted}
            onCheck={() => {
              const line = pickPraise("stop", stopPraise ?? undefined);
              setStopPraise(line);
              speakPraise(line);
              onCheck();
            }}
          />
          {chunk.isCompleted ? (
            <div className="dictation-win">
              <p className="dictation-win-copy">{stopPraise ?? "一句就够了。"}</p>
              <div className="dictation-win-actions">
                <button type="button" className="solid" onClick={onMore}>
                  再来一句
                </button>
                <button type="button" className="quiet" onClick={onStop}>
                  今天到此
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
