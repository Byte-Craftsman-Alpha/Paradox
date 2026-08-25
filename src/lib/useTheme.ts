"use client";
import { useEffect, useState } from "react";
import type { Theme } from "./content";

const KEY = "tp:theme";

function read(): Theme {
  if (typeof window === "undefined") return "milk";
  const v = window.localStorage.getItem(KEY);
  if (v === "charcoal" || v === "milk") return v;
  return "milk";
}

function apply(t: Theme) {
  if (typeof document === "undefined") return;
  if (t === "system") {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    document.documentElement.dataset.theme = mql.matches ? "charcoal" : "milk";
  } else {
    document.documentElement.dataset.theme = t;
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(read);

  useEffect(() => {
    apply(theme);
    if (theme === "system") {
      window.localStorage.removeItem(KEY);
    } else {
      window.localStorage.setItem(KEY, theme);
    }
  }, [theme]);

  // React to system changes when in system mode
  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => apply("system");
    mql.addEventListener("change", on);
    return () => mql.removeEventListener("change", on);
  }, [theme]);

  return { theme, setTheme, themes: ["milk", "charcoal", "system"] as Theme[] };
}
