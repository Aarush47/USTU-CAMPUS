import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "../hooks/useThemeMode";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeMode();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
      aria-label={isDark ? "Switch to bright mode" : "Switch to dark mode"}
      title={isDark ? "Bright mode" : "Dark mode"}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span className="text-xs font-medium">{isDark ? "Bright" : "Dark"}</span>
    </button>
  );
}
