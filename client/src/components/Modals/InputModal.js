import React from "react";

function InputModal({ open, isOpen, submit, title = "Input Data", body = "Enter data below:", type = "text", button = "Save", reset = true, value = "", inputOptions = {} }) {
  const [data, setData] = React.useState(value);
  const [inputEle, setInputEle] = React.useState(null);

  const finish = () => {
    submit(data);
    open(false);
    if (reset) setData("");
  };

  const onSubmit = (e) => {
    e.preventDefault();
    finish();
  };

  const inputRef = React.useCallback(node => {
    setInputEle(node);
  }, []);

  React.useEffect(() => {
    if (isOpen && inputEle) {
      inputEle.focus();
    }
  }, [isOpen, inputEle]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200/60 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h5 className="text-base font-bold text-stone-900">
            {title}
          </h5>
          <button
            onClick={() => open(false)}
            type="button"
            className="text-stone-400 hover:text-stone-600 transition-colors w-8 h-8 rounded-lg flex items-center justify-center hover:bg-stone-50"
            aria-label="Close"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-4">
          {body && <p className="text-stone-600 text-sm">{body}</p>}
          <form onSubmit={onSubmit}>
            <input
              type={type}
              value={data || value}
              onChange={e => setData(e.target.value)}
              ref={inputRef}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[var(--cs-brand)] focus:border-transparent text-sm text-stone-900 bg-stone-50/50"
              {...inputOptions}
            />
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 bg-stone-50 border-t border-stone-100">
          <button
            type="button"
            onClick={() => open(false)}
            className="px-4 py-2 border border-stone-200 text-stone-600 hover:bg-stone-100/60 rounded-xl text-xs font-semibold transition-all"
          >
            Cancel
          </button>
          {submit && (
            <button
              type="button"
              onClick={finish}
              className="px-4 py-2 bg-[var(--cs-brand)] hover:bg-[var(--cs-brand-hover)] text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
            >
              {button}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default InputModal;
