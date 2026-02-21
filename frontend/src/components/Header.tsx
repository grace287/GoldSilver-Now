"use client";

import { useTheme } from "./ThemeProvider";

export function Header() {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80">
      <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl" aria-hidden>🟡</span>
            금은나우 <span className="text-sm font-normal text-gray-500 dark:text-gray-400">(GoldSilver Now)</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            지금, 금과 은의 온도.
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}
