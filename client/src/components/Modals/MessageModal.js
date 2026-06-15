import React from "react";

function MessageModal({ open, isOpen, title, body, submit }) {
  const finish = () => {
    if (submit) submit();
    open(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200/60 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h5 className="text-base font-bold text-stone-900">
            {title ? title : "Notification"}
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
        <div className="px-6 py-6">
          <p className="text-stone-600 text-sm leading-relaxed">{body}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 bg-stone-50 border-t border-stone-100">
          <button
            type="button"
            onClick={finish}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageModal;