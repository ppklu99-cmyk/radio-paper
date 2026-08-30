type HandCheckProps = {
  checked: boolean;
  onCheck: () => void;
};

export default function HandCheck({ checked, onCheck }: HandCheckProps) {
  return (
    <div className="hand-check-wrap">
      <button
        type="button"
        className={checked ? "hand-check is-checked" : "hand-check"}
        aria-pressed={checked}
        aria-label="勾上完成"
        onClick={() => {
          if (!checked) onCheck();
        }}
      >
        <svg
          className="hand-check-svg"
          width="56"
          height="56"
          viewBox="0 0 44 44"
          fill="none"
          aria-hidden="true"
        >
          <path d="M9.2 8.6 L35.4 10.1" />
          <path d="M36.1 11.4 L34.6 33.8" />
          <path d="M33.2 35.6 L8.8 33.9" />
          <path d="M8.1 32.2 L10.4 10.5" />
          {checked ? (
            <path
              className="hand-check-mark"
              d="M13 23.2 C15.2 25.8, 17.8 29.4, 20.4 31.6 C24.6 22.4, 29.8 14.8, 34.8 11.2"
            />
          ) : null}
        </svg>
      </button>
    </div>
  );
}
