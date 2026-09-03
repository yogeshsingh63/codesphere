import React from "react";

export function copyText(text) {
  const value = String(text ?? "");
  if (!value) return Promise.resolve(false);
  try {
    if (navigator?.clipboard?.writeText) {
      return navigator.clipboard.writeText(value).then(() => true, () => false);
    }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return Promise.resolve(ok);
  } catch {
    return Promise.resolve(false);
  }
}

export default function CopyChip({ value, label, className = "" }) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef(null);

  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await copyText(value);
    if (ok) {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      title={copied ? "Copied!" : `Copy ${label || "code"}`}
      aria-label={copied ? "Copied to clipboard" : `Copy ${label || "code"} ${value} to clipboard`}
      className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border border-[var(--cs-border)] bg-black/[0.03] px-2 py-1 font-mono text-[11px] font-medium text-[var(--cs-ink-muted)] transition-colors hover:border-[var(--cs-brand)] hover:text-[var(--cs-brand)] dark:bg-white/[0.04] ${className}`}
    >
      <span className="truncate">{value}</span>
      <i className={`fas ${copied ? "fa-check text-emerald-500" : "fa-copy"} shrink-0 text-[10px]`} aria-hidden="true" />
    </button>
  );
}
