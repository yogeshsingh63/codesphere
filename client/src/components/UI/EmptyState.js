import React from "react";
import { Link } from "react-router-dom";

export default function EmptyState({ icon = "fa-inbox", title, body, actionTo, actionText, secondary }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--cs-brand-soft)] text-[var(--cs-brand)]">
        <i className={`fas ${icon} text-xl`} aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold tracking-tight text-[var(--cs-ink)]">{title}</h3>
      {body && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-[var(--cs-ink-muted)]">{body}</p>
      )}
      {(actionTo || secondary) && (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {actionTo && (
            <Link
              to={actionTo}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cs-brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--cs-brand-hover)]"
            >
              {actionText}
            </Link>
          )}
          {secondary}
        </div>
      )}
    </div>
  );
}
