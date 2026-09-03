import React from "react";

export default function Footer({ dark = false }) {
  return (
    <footer
      className={
        dark
          ? "border-t border-white/10 bg-[#0f172a] text-slate-400"
          : "border-t border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] text-[var(--cs-ink-muted)]"
      }
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium">© {new Date().getFullYear()} CodeSphere · Collaborative coding rooms</p>
        <div className="flex items-center gap-4">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/yogeshsingh63/CodeSphere"
            aria-label="CodeSphere on GitHub"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent hover:border-[var(--cs-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <i className="fab fa-github text-lg" aria-hidden="true" />
          </a>
          <a href="/rooms/list" className="text-xs font-semibold hover:underline">
            Browse rooms
          </a>
        </div>
      </div>
    </footer>
  );
}
