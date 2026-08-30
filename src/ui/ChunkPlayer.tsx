import { useEffect, useRef, useState } from "react";
import { shouldSeekToStart } from "../lib/media";

export type ChunkPlayerProps = {
  src: string;
  startTime: number;
  endTime: number;
  showVideo: boolean;
  onHideVideo: () => void;
  replayNonce?: number;
};

export default function ChunkPlayer({
  src,
  startTime,
  endTime,
  showVideo,
  onHideVideo,
  replayNonce = 0,
}: ChunkPlayerProps) {
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const [playing, setPlaying] = useState(false);

  function loopIfNeeded(el: HTMLMediaElement) {
    if (shouldSeekToStart(el.currentTime, startTime, endTime)) {
      el.currentTime = startTime;
    }
  }

  async function playFromStart() {
    const el = mediaRef.current;
    if (!el) return;
    try {
      if (el.readyState >= 1) el.currentTime = startTime;
      await el.play();
      if (Math.abs(el.currentTime - startTime) > 0.35) {
        el.currentTime = startTime;
        await el.play();
      }
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;

    function onMeta() {
      el.currentTime = startTime;
    }
    function onTime() {
      loopIfNeeded(el);
    }
    function onPlay() {
      setPlaying(true);
    }
    function onPause() {
      setPlaying(false);
    }

    el.setAttribute("playsinline", "true");
    el.setAttribute("webkit-playsinline", "true");
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    if (el.readyState >= 1) el.currentTime = startTime;
    void playFromStart();

    return () => {
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, [src, startTime, endTime, showVideo, replayNonce]);

  return (
    <div className="chunk-player">
      {showVideo ? (
        <video
          ref={mediaRef}
          className="chunk-player-video"
          src={src}
          playsInline
          preload="auto"
          onTimeUpdate={(event) => loopIfNeeded(event.currentTarget)}
        />
      ) : (
        <audio
          ref={mediaRef}
          className="dictation-audio"
          src={src}
          controls
          playsInline
          preload="auto"
          onTimeUpdate={(event) => loopIfNeeded(event.currentTarget)}
        />
      )}
      <button type="button" className="solid" onClick={() => void playFromStart()}>
        {playing ? "再听这句" : "播放这句"}
      </button>
      {showVideo ? (
        <button type="button" className="quiet" onClick={onHideVideo}>
          收起画面
        </button>
      ) : null}
    </div>
  );
}
