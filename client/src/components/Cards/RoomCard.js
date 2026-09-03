import React from "react";
import { Link } from "react-router-dom";
import CopyChip from "components/UI/CopyChip.js";

function progressOf(completed) {
  if (!completed?.room?.sections?.length) return null;
  const total = completed.room.sections.length;
  const done = Array.isArray(completed.sections) ? completed.sections.length : 0;
  return Math.round((done / total) * 100);
}

export default function RoomCard({
  title,
  desc,
  code,
  author,
  completed,
  sectionsCount,
  action,
  buttons = [],
  icon = "fa-layer-group",
}) {
  const progress = progressOf(completed);
  const done = progress === 100;

  return (
    <article className="group relative flex min-h-[210px] flex-col justify-between overflow-hidden rounded-2xl border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[var(--cs-brand-gradient)] transition-transform duration-300 group-hover:scale-x-100"
      />
      <div className="min-w-0">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--cs-brand-soft)] text-[var(--cs-brand)] transition-transform duration-300 group-hover:scale-110">
            <i className={`fas ${icon}`} aria-hidden="true" />
          </div>
          {done ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              <i className="fas fa-check-circle" aria-hidden="true" /> Done
            </span>
          ) : progress != null ? (
            <span className="inline-flex shrink-0 items-center rounded-full border border-[var(--cs-border)] bg-[var(--cs-surface)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--cs-ink-muted)]">
              {progress}%
            </span>
          ) : author ? (
            <span className="inline-flex min-w-0 shrink-0 items-center gap-1 truncate rounded-full border border-[var(--cs-border)] bg-[var(--cs-surface)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--cs-ink-muted)]">
              <i className="fas fa-user shrink-0 text-[9px]" aria-hidden="true" />
              <span className="truncate">{author}</span>
            </span>
          ) : null}
        </div>
        <h4 className="cs-clamp-1 text-[15px] font-bold tracking-tight text-[var(--cs-ink)] transition-colors group-hover:text-[var(--cs-brand)]">
          {title || "Untitled room"}
        </h4>
        <p className="cs-clamp-2 mt-1 text-[13px] leading-relaxed text-[var(--cs-ink-muted)]">
          {desc || "No description provided."}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-medium text-[var(--cs-ink-faint)]">
          {typeof sectionsCount === "number" && (
            <span className="inline-flex items-center gap-1">
              <i className="fas fa-list-ul" aria-hidden="true" /> {sectionsCount} section{sectionsCount === 1 ? "" : "s"}
            </span>
          )}
          {author && progress != null && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <i className="fas fa-user shrink-0" aria-hidden="true" />
              <span className="truncate">{author}</span>
            </span>
          )}
          {code && <CopyChip value={code} label="room code" />}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {progress != null && (
          <div aria-label={`Progress ${progress} percent`}>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${done ? "bg-emerald-500" : "bg-[var(--cs-brand)]"}`}
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {action && (
            <Link
              to={action.to}
              className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[var(--cs-brand)] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[var(--cs-brand-hover)]"
            >
              {action.text} <i className="fas fa-arrow-right text-[10px]" aria-hidden="true" />
            </Link>
          )}
          {buttons.map((button, i) => {
            const isDanger = button.color === "danger";
            const isGhost = button.color === "ghost";
            const btnClass = isDanger
              ? "inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-[var(--cs-border)] text-[var(--cs-ink-muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/20 text-xs font-semibold transition-colors"
              : isGhost
                ? "inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-[var(--cs-border)] text-[var(--cs-ink)] hover:border-[var(--cs-brand)] hover:text-[var(--cs-brand)] text-xs font-bold transition-colors"
                : "inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[var(--cs-brand)] text-white hover:bg-[var(--cs-brand-hover)] rounded-xl text-xs font-bold transition-colors shadow-sm";
            const content = (<>{button.text} {button.to && !isDanger && <i className="fas fa-arrow-right text-[10px]" aria-hidden="true" />}</>);
            return button.to ? (
              <Link key={i} to={button.to} onClick={() => button.onClick && button.onClick(title)} className={`${btnClass} ${action ? "" : "flex-1"}`}>
                {content}
              </Link>
            ) : (
              <button key={i} type="button" onClick={() => button.onClick && button.onClick(title)} className={`${btnClass} ${action ? "" : "flex-1"}`}>
                {content}
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}
