import React from "react";
import { useAlertState } from "context/alert.js";

function PaginatedTable({ columns, items = [], pageSize = 5 }) {
  const safeItems = Array.isArray(items) ? items : [];
  const pageCount = Math.ceil(safeItems.length / pageSize) || 1;
  const [ page, setPage ] = React.useState(0);

  const { setInputOptions } = useAlertState();

  const clamp = (num, min, max) => Math.min(Math.max(Number.isFinite(num) ? num : min, min), max);

  React.useEffect(() => {
    setPage((p) => clamp(p, 0, pageCount - 1));
  }, [pageCount]);

  const back = () => {
    setPage((p) => clamp(p - 1, 0, pageCount - 1));
  };
  const forward = () => {
    setPage((p) => clamp(p + 1, 0, pageCount - 1));
  };

  const currentPageItems = safeItems.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="bg-[var(--cs-surface-elevated)] border border-[var(--cs-border)] rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col gap-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--cs-border)]">
              {columns.map((col, i) => (
                <th key={i} scope="col" className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-wider text-[var(--cs-ink-faint)]">
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentPageItems.length > 0 ? (
              currentPageItems.map((item, i) => (
                <tr key={item?.code ?? i} className="border-b border-[var(--cs-border)]/60 hover:bg-black/[0.02] dark:hover:bg-[var(--cs-surface-elevated)]/[0.03] transition-colors">
                  {columns.map((col, j) => (
                    <td key={j} className="py-3 pr-4 text-sm text-[var(--cs-ink-muted)] align-middle">
                      {col.formatter ? col.formatter(item) : (item?.[col.field] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-sm text-[var(--cs-ink-faint)] font-medium">
                  No rooms found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mt-2">
        <div className="flex items-center gap-1" role="navigation" aria-label="Pagination">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage(0)}
            className="w-8 h-8 rounded-lg border border-[var(--cs-border)] flex items-center justify-center text-[var(--cs-ink-muted)] hover:bg-black/5 dark:hover:bg-[var(--cs-surface-elevated)]/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            aria-label="First page"
          >
            <i className="fas fa-angle-double-left text-xs" aria-hidden="true"></i>
          </button>
          
          <button
            type="button"
            disabled={page === 0}
            onClick={back}
            className="w-8 h-8 rounded-lg border border-[var(--cs-border)] flex items-center justify-center text-[var(--cs-ink-muted)] hover:bg-black/5 dark:hover:bg-[var(--cs-surface-elevated)]/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            aria-label="Previous page"
          >
            <i className="fas fa-angle-left text-xs" aria-hidden="true"></i>
          </button>

          <button
            type="button"
            onClick={() => setInputOptions({
              title: "Input page number",
              body: "Enter page number below:",
              type: "number",
              button: "Navigate",
              value: `${page+1}`,
              submit: (p) => setPage(clamp(parseInt(p, 10) - 1, 0, pageCount - 1)),
              inputOptions: {
                min: 1,
                max: pageCount
              }
            })}
            className="h-8 px-3 rounded-lg bg-[var(--cs-brand)] text-white font-semibold text-xs transition-colors hover:bg-[var(--cs-brand-hover)]"
            aria-label={`Page ${page + 1} of ${pageCount}`}
          >
            {page + 1}
          </button>

          <button
            type="button"
            disabled={page === pageCount - 1}
            onClick={forward}
            className="w-8 h-8 rounded-lg border border-[var(--cs-border)] flex items-center justify-center text-[var(--cs-ink-muted)] hover:bg-black/5 dark:hover:bg-[var(--cs-surface-elevated)]/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            aria-label="Next page"
          >
            <i className="fas fa-angle-right text-xs" aria-hidden="true"></i>
          </button>
          
          <button
            type="button"
            disabled={page === pageCount - 1}
            onClick={() => setPage(pageCount - 1)}
            className="w-8 h-8 rounded-lg border border-[var(--cs-border)] flex items-center justify-center text-[var(--cs-ink-muted)] hover:bg-black/5 dark:hover:bg-[var(--cs-surface-elevated)]/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            aria-label="Last page"
          >
            <i className="fas fa-angle-double-right text-xs" aria-hidden="true"></i>
          </button>
        </div>

        <p className="text-xs text-[var(--cs-ink-muted)]" aria-live="polite">
          Showing items <strong className="text-[var(--cs-ink)]">{safeItems.length === 0 ? 0 : page * pageSize + 1}</strong> - <strong className="text-[var(--cs-ink)]">{Math.min((page + 1) * pageSize, safeItems.length)}</strong> of <strong className="text-[var(--cs-ink)]">{safeItems.length}</strong>
        </p>
      </div>
    </div>
  );
}

export default PaginatedTable;
