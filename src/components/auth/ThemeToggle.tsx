import { useCallback, useEffect, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "theme";
type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  
  // Force default to light if no explicit preference exists
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, "light");
    return "light";
  }
  
  return stored === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    applyTheme(getInitialTheme());
  }, []);
  return <>{children}</>;
}

export function ThemeToggle() {
  const toggleTheme = useCallback(() => {
    const isDark = document.documentElement.classList.contains("dark");
    const next: Theme = isDark ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      title="Toggle theme"
      className="cursor-pointer"
    >
      <Sun className="h-4 w-4 hidden dark:block" />
      <Moon className="h-4 w-4 block dark:hidden" />
    </Button>
  );
}