import { useState } from "react";
import { isValidSyncCode } from "../lib/syncCode";

type SettingsPageProps = {
  syncCode: string;
  onBind: (code: string) => void;
  onRegenerate: () => void;
  onBack: () => void;
};

export default function SettingsPage({
  syncCode,
  onBind,
  onRegenerate,
  onBack,
}: SettingsPageProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  function bind() {
    const next = draft.trim().toUpperCase();
    if (!isValidSyncCode(next)) {
      setError("格式如 BLUE-4K-MINT");
      return;
    }
    setError("");
    onBind(next);
  }

  return (
    <section className="settings">
      <button type="button" className="quiet" onClick={onBack}>
        返回
      </button>
      <h1 className="page-title">设置</h1>
      <p className="sync-code">{syncCode}</p>
      <button
        type="button"
        className="quiet"
        onClick={() => void navigator.clipboard.writeText(syncCode)}
      >
        复制
      </button>
      <p className="banner">知道这串码的人都能看到课文和进度。</p>
      <p className="banner">
        在 iPhone / iPad 上：用 Safari 打开 {__LAN_URL__}，点分享 → 添加到主屏幕。电脑不用开。点卡片会出声；若没有，再点「播放这句」。
      </p>
      <input
        className="dictation-input"
        style={{ minHeight: 0 }}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="另一台的同步码"
        aria-label="同步码"
      />
      {error ? <p className="banner">{error}</p> : null}
      <div className="actions">
        <button type="button" className="solid" onClick={bind}>
          绑定
        </button>
        <button
          type="button"
          className="quiet"
          onClick={() => onRegenerate()}
        >
          重新生成
        </button>
      </div>
    </section>
  );
}
