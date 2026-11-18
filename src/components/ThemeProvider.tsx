"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme-script";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let saved: Theme = "system";
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        saved = stored;
      }
    } catch {
      saved = "system";
    }
    setThemeState(saved);

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const computeResolved = (t: Theme): "light" | "dark" => {
      if (t === "dark") return "dark";
      if (t === "light") return "light";
      return mql.matches ? "dark" : "light";
    };

    const currentResolved = computeResolved(saved);
    setResolvedTheme(currentResolved);
    if (currentResolved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const handler = () => {
      let activeTheme: Theme = "system";
      try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === "light" || stored === "dark") {
          activeTheme = stored;
        }
      } catch {
        activeTheme = "system";
      }

      if (activeTheme === "system") {
        const next = mql.matches ? "dark" : "light";
        setResolvedTheme(next);
        document.documentElement.classList.toggle("dark", next === "dark");
      }
    };

    if (mql.addEventListener) {
      mql.addEventListener("change", handler);
    } else if ((mql as unknown as { addListener?: (fn: () => void) => void }).addListener) {
      (mql as unknown as { addListener: (fn: () => void) => void }).addListener(handler);
    }

    setMounted(true);

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", handler);
      } else if ((mql as unknown as { removeListener?: (fn: () => void) => void }).removeListener) {
        (mql as unknown as { removeListener: (fn: () => void) => void }).removeListener(handler);
      }
    };
  }, []);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    try {
      if (nextTheme === "system") {
        localStorage.removeItem(THEME_STORAGE_KEY);
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setResolvedTheme(isDark ? "dark" : "light");
        document.documentElement.classList.toggle("dark", isDark);
      } else {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        setResolvedTheme(nextTheme);
        document.documentElement.classList.toggle("dark", nextTheme === "dark");
      }
    } catch {
      // Storage unavailable or disabled
    }
  };

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme: mounted ? resolvedTheme : "light",
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
