"use client";

import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-between w-full max-w-md border-2 border-[var(--fg)] px-5 py-4"
    >
      <div className="text-left">
        <div className="font-display font-bold text-sm">
          {isDark ? "Dark mode" : "Light mode"}
        </div>
        <div className="text-xs text-[var(--muted)] mt-0.5">
          Applies across the whole site
        </div>
      </div>
      <div
        className="w-12 h-7 border-2 border-[var(--fg)] relative shrink-0"
        aria-hidden
      >
        <div
          className="absolute top-0.5 w-4 h-4 bg-[var(--fg)] transition-all"
          style={{ left: isDark ? "2px" : "24px" }}
        />
      </div>
    </button>
  );
}