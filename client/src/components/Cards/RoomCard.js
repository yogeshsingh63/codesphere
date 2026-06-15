import React from "react";
import { Link } from "react-router-dom";

function RoomCard({ title, desc, completed, buttons = [] }) {
  let progress = 0;
  if (completed && completed.room && completed.room.sections) {
    progress = (completed.sections.length / completed.room.sections.length) * 100;
  }

  return (
    <div className="group bg-white border border-stone-200 rounded-2xl p-6 flex flex-col justify-between min-h-[180px] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out">
      <div>
        <div className="flex justify-between items-start gap-4 mb-2">
          <h4 className="text-stone-900 text-base font-semibold tracking-tight leading-snug group-hover:text-orange-700 transition-colors">
            {title}
          </h4>
          {completed && progress === 100 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
              <i className="fas fa-check-circle"></i> Done
            </span>
          )}
        </div>
        <p className="text-stone-500 text-xs leading-relaxed mb-6">
          {desc}
        </p>
      </div>

      <div className="space-y-4">
        {completed && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-medium text-stone-400">
              <span>Progress</span>
              <span>{parseInt(progress) || 0}%</span>
            </div>
            <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
              <div
                className="bg-orange-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {buttons && buttons.map((button, i) => {
            const isDanger = button.color === "danger";
            const btnClass = isDanger
              ? "inline-flex items-center justify-center px-3 py-1.5 border border-stone-200 text-stone-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-lg text-xs font-semibold transition-all"
              : "inline-flex items-center justify-center px-4 py-2 bg-[#c2410c] text-white hover:bg-[#a83a0a] rounded-lg text-xs font-semibold transition-all shadow-sm";

            return button.to ? (
              <Link
                key={i}
                to={button.to}
                onClick={e => button.onClick && button.onClick(title)}
                className={btnClass}
              >
                {button.text}
              </Link>
            ) : (
              <button
                key={i}
                onClick={e => button.onClick && button.onClick(title)}
                className={btnClass}
              >
                {button.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RoomCard;