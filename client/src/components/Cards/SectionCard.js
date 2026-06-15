import React from "react";
import { Link } from "react-router-dom";

function SectionCard({ title, desc, onClick = () => {}, onDelete = null, to, button = "Edit" }) {
  return (
    <div className="group bg-white border border-stone-200 rounded-2xl p-6 flex flex-col justify-between min-h-[180px] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out">
      <div>
        <h4 className="text-stone-900 text-base font-semibold tracking-tight leading-snug group-hover:text-orange-700 transition-colors mb-2">
          {title}
        </h4>
        <p className="text-stone-500 text-xs leading-relaxed mb-6">
          {desc}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {to ? (
          <Link
            to={to}
            onClick={e => onClick(title)}
            className="px-3.5 py-1.5 bg-stone-900 text-white hover:bg-orange-700 rounded-lg text-[11px] font-semibold transition-all shadow-xs"
          >
            {button}
          </Link>
        ) : (
          <button
            onClick={e => onClick(title)}
            className="px-3.5 py-1.5 bg-stone-900 text-white hover:bg-orange-700 rounded-lg text-[11px] font-semibold transition-all shadow-xs"
          >
            {button}
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={e => onDelete(title)}
            className="px-3 py-1.5 border border-stone-200 text-stone-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-lg text-[11px] font-semibold transition-all"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default SectionCard;