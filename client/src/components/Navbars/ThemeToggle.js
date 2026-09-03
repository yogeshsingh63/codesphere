import React from "react";
import { useTheme } from "context/theme.js";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--cs-border)] text-[var(--cs-ink-muted)] hover:text-[var(--cs-ink)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${className}`}
    >
      <i className={`fas ${isDark ? "fa-sun" : "fa-moon"}`} aria-hidden="true" />
    </button>
  );
}
