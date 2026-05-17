"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-slate-200/50 hover:bg-slate-300/50 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
      aria-label="Toggle Theme"
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}
