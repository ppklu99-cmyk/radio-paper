import { useRef, useState } from "react";
import { pickPraise } from "../lib/praise";

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
  const [blocked, setBlocked] = useState(false);

  async function start() {
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
        setPraise((last) => pickPraise(ratio < 0.7 ? "messy" : "afterShadow", last ?? undefined));
        onShadowed();
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setBlocked(true);
    }
  }

  function stop() {
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
        <p className="banner">听写还可以继续</p>
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
