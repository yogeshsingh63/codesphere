import React from "react";
import { useAlertState } from "context/alert.js";

function PaginatedTable({ columns, items, pageSize = 5 }) {
  const pageCount = Math.ceil(items.length / pageSize) || 1;
  const [ page, setPage ] = React.useState(0);

  const { setInputOptions } = useAlertState();

  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

  const back = () => {
    setPage(clamp(page - 1, 0, pageCount - 1));
  };
  const forward = () => {
    setPage(clamp(page + 1, 0, pageCount - 1));
  };

  const currentPageItems = items.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="bg-white border border-stone-200/60 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col gap-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-100">
              {columns.map((col, i) => (
                <th key={i} className="pb-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentPageItems.length > 0 ? (
              currentPageItems.map((item, i) => (
                <tr key={i} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                  {columns.map((col, j) => (
                    <td key={j} className="py-3 text-sm text-stone-600 align-middle">
                      {col.formatter ? col.formatter(item) : item[col.field] || ""}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-sm text-stone-400 font-medium">
                  No rooms found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mt-2">
        <div className="flex items-center gap-1">
          <button
            disabled={page === 0}
            onClick={() => setPage(0)}
            className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            aria-label="First page"
          >
            <i className="fas fa-angle-double-left text-xs"></i>
          </button>
          
          <button
            disabled={page === 0}
            onClick={back}
            className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            aria-label="Previous page"
          >
            <i className="fas fa-angle-left text-xs"></i>
          </button>

          <button
            onClick={() => setInputOptions({
              title: "Input page number",
              body: "Enter page number below:",
              type: "number",
              button: "Navigate",
              value: `${page+1}`,
              submit: (p) => setPage(clamp(parseInt(p) - 1, 0, pageCount - 1)),
              inputOptions: {
                min: 1,
                max: pageCount
              }
            })}
            className="h-8 px-3 rounded-lg bg-[#c2410c] text-white font-semibold text-xs transition-all hover:bg-[#a13207]"
          >
            {page + 1}
          </button>

          <button
            disabled={page === pageCount - 1}
            onClick={forward}
            className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            aria-label="Next page"
          >
            <i className="fas fa-angle-right text-xs"></i>
          </button>
          
          <button
            disabled={page === pageCount - 1}
            onClick={() => setPage(pageCount - 1)}
            className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            aria-label="Last page"
          >
            <i className="fas fa-angle-double-right text-xs"></i>
          </button>
        </div>

        <p className="text-xs text-stone-500">
          Showing items <strong className="text-stone-700">{items.length === 0 ? 0 : page * pageSize + 1}</strong> - <strong className="text-stone-700">{Math.min((page + 1) * pageSize, items.length)}</strong> of <strong className="text-stone-700">{items.length}</strong>
        </p>
      </div>
    </div>
  );
}

export default PaginatedTable;