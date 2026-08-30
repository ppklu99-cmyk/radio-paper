import { useRef, useState } from "react";
import { pickPraise } from "../lib/praise";
import { speakPraise } from "../lib/speakPraise";

type ShadowPanelProps = {
  ratio: number;
  onShadowed: () => void;
  onReplayOriginal: () => void;
};

function pickMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
  if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  return "";
}

export default function ShadowPanel({
  ratio,
  onShadowed,
  onReplayOriginal,
}: ShadowPanelProps) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [praise, setPraise] = useState<string | null>(null);
  const [selfUrl, setSelfUrl] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);

  async function start() {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setBlocked("请用 Safari 打开 https://zhiben.xyz 再录音。http 地址系统不给麦克风。");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickMime();
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (selfUrl) URL.revokeObjectURL(selfUrl);
        setSelfUrl(URL.createObjectURL(blob));
        onShadowed();
      };
      recorderRef.current = recorder;
      if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
      recorder.start();
      setRecording(true);
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setBlocked("麦克风被拒绝了。到 设置 → Safari → 麦克风，允许后再点录音。");
        return;
      }
      setBlocked("这次没录上。听写还可以继续。");
    }
  }

  function stop() {
    const line = pickPraise(ratio < 0.7 ? "messy" : "afterShadow", praise ?? undefined);
    setPraise(line);
    speakPraise(line);
    recorderRef.current?.stop();
    setRecording(false);
  }

  function playSelf() {
    if (!selfUrl) return;
    const audio = new Audio(selfUrl);
    void audio.play();
  }

  return (
    <div className="shadow">
      <p className="session-remain">跟读（可跳过）</p>
      {blocked ? (
        <p className="banner">{blocked}</p>
      ) : (
        <div className="actions">
          <button type="button" className="solid" onClick={recording ? stop : start}>
            {recording ? "停止" : "录音"}
          </button>
          <button type="button" className="quiet" onClick={onReplayOriginal}>
            听原声
          </button>
          {selfUrl ? (
            <button type="button" className="quiet" onClick={playSelf}>
              听自己的
            </button>
          ) : null}
        </div>
      )}
      {praise ? <p className="shadow-praise">{praise}</p> : null}
    </div>
  );
}
