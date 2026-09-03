import React from "react";
import { Link } from "react-router-dom";

const TYPE_ICONS = {
  info: "fa-circle-info",
  coding: "fa-code",
  quiz: "fa-circle-question",
  flag: "fa-flag",
  website: "fa-globe",
};

function SectionCard({ title, desc, type, onClick = () => {}, onDelete = null, to, button = "Edit" }) {
  return (
    <div className="group flex min-h-[170px] flex-col justify-between rounded-2xl border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="min-w-0">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--cs-brand-soft)] text-[var(--cs-brand)]">
            <i className={`fas ${TYPE_ICONS[type] || "fa-file-lines"}`} aria-hidden="true" />
          </div>
          {type && (
            <span className="rounded-full border border-[var(--cs-border)] bg-[var(--cs-surface)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--cs-ink-faint)]">
              {type}
            </span>
          )}
        </div>
        <h4 className="cs-clamp-1 text-[15px] font-bold tracking-tight text-[var(--cs-ink)] transition-colors group-hover:text-[var(--cs-brand)]">
          {title}
        </h4>
        <p className="cs-clamp-2 mt-1 text-xs leading-relaxed text-[var(--cs-ink-muted)]">
          {desc}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {to ? (
          <Link
            to={to}
            onClick={() => onClick(title)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--cs-ink)] px-3.5 py-2 text-[11px] font-bold text-white transition-opacity hover:opacity-90"
          >
            {button}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onClick(title)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--cs-ink)] px-3.5 py-2 text-[11px] font-bold text-white transition-opacity hover:opacity-90"
          >
            {button}
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(title)}
            aria-label={`Delete section ${title}`}
            className="inline-flex items-center justify-center rounded-xl border border-[var(--cs-border)] px-3 py-2 text-[11px] font-semibold text-[var(--cs-ink-muted)] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-500/20 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <i className="fas fa-trash-can" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

export default SectionCard;
