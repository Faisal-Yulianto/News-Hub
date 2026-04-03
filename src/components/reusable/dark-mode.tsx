"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <>
      <div className="group-data-[collapsible=icon]:flex hidden justify-center">
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? "🌙" : "☀️"}
        </button>
      </div>
      <div className="group-data-[collapsible=icon]:hidden flex items-center gap-x-6 mr-1">
        <label htmlFor="dark-mode" className="text-[18px] font-semibold">
          {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </label>
        <Switch
          id="dark-mode"
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        />
      </div>
    </>
  );
}