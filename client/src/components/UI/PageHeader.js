import React from "react";

export default function PageHeader({ eyebrow, title, description, actions, stats }) {
  return (
    <div className="border-b border-[var(--cs-border)] bg-[var(--cs-surface-elevated)]">
      <div className="container mx-auto px-4 py-8 sm:px-6 md:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-2xl">
            {eyebrow && (
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--cs-brand)]">
                {eyebrow}
              </p>
            )}
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--cs-ink)] sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-sm leading-relaxed text-[var(--cs-ink-muted)] sm:text-[15px]">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:justify-end">
              {actions}
            </div>
          )}
        </div>
        {stats && stats.length > 0 && (
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-[var(--cs-border)] bg-[var(--cs-surface)] px-4 py-3"
              >
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--cs-ink-faint)]">
                  {s.label}
                </dt>
                <dd className="mt-0.5 truncate text-xl font-extrabold tracking-tight text-[var(--cs-ink)]">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
